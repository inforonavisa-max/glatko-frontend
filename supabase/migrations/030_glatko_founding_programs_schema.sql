-- ═══════════════════════════════════════════════════════════════════════════
-- G-LAUNCH-1: Founding Provider + Founding Customer programs
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Soft launch (Boka Bay: Budva, Kotor, Tivat) için founding incentives:
--   - İlk 50 onaylı pro → Founding Provider rozeti, Year 2'de 3 ay ücretsiz
--     featured placement (featured_until = 2027-08-01)
--   - İlk 100 müşteri (talep gönderen) → Founding Customer rozeti + 5 free credit
--
-- Auto-flag mantığı:
--   - Pro: BEFORE UPDATE OF verification_status trigger ile, transition
--     pending|in_review → approved sırasında check
--   - Customer: server action submit sonrası RPC çağrısı ile (ilk-talep eşiği)
--
-- Admin gözlem yüzeyi: glatko_launch_metrics() RPC, single JSON döner.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Founding Provider columns on existing pro profiles table ──────────

DO $$
BEGIN
  ALTER TABLE public.glatko_professional_profiles
    ADD COLUMN IF NOT EXISTS is_founding_provider BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS founding_provider_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS founding_provider_number INTEGER,
    ADD COLUMN IF NOT EXISTS featured_until DATE;
END $$;

CREATE INDEX IF NOT EXISTS idx_pro_founding
  ON public.glatko_professional_profiles (is_founding_provider)
  WHERE is_founding_provider = true;

COMMENT ON COLUMN public.glatko_professional_profiles.is_founding_provider IS
'G-LAUNCH-1: true for the first 50 approved pros (auto-set by trigger).';

COMMENT ON COLUMN public.glatko_professional_profiles.founding_provider_number IS
'G-LAUNCH-1: 1..50 ordinal — never reused, persists for badge display.';

COMMENT ON COLUMN public.glatko_professional_profiles.featured_until IS
'G-LAUNCH-1: free featured placement end date for founding pros (Year 2 + 3mo).';

-- ─── 2. Customer profiles table (parallel to professional_profiles) ──────

CREATE TABLE IF NOT EXISTS public.glatko_customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  is_founding_customer BOOLEAN DEFAULT false,
  founding_customer_at TIMESTAMPTZ,
  founding_customer_number INTEGER,

  free_credits INTEGER DEFAULT 0
    CHECK (free_credits >= 0),

  total_requests INTEGER DEFAULT 0
    CHECK (total_requests >= 0),
  total_completed_jobs INTEGER DEFAULT 0
    CHECK (total_completed_jobs >= 0),

  preferred_locale TEXT
    CHECK (preferred_locale IS NULL OR preferred_locale IN
      ('me','sr','en','tr','de','it','ru','ar','uk')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_founding
  ON public.glatko_customer_profiles (is_founding_customer)
  WHERE is_founding_customer = true;

COMMENT ON TABLE public.glatko_customer_profiles IS
'G-LAUNCH-1: per-customer profile mirroring glatko_professional_profiles.
Auto-created via glatko_ensure_customer_profile() RPC on first request.
Tracks founding status, free credits, and aggregate counters.';

-- ─── 3. RLS for customer profiles ────────────────────────────────────────

ALTER TABLE public.glatko_customer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own customer profile"
  ON public.glatko_customer_profiles;
CREATE POLICY "Users read own customer profile"
  ON public.glatko_customer_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own customer profile"
  ON public.glatko_customer_profiles;
CREATE POLICY "Users update own customer profile"
  ON public.glatko_customer_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public counts founding customers"
  ON public.glatko_customer_profiles;
CREATE POLICY "Public counts founding customers"
  ON public.glatko_customer_profiles FOR SELECT
  USING (is_founding_customer = true);

DROP POLICY IF EXISTS "Admins manage all customer profiles"
  ON public.glatko_customer_profiles;
CREATE POLICY "Admins manage all customer profiles"
  ON public.glatko_customer_profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.glatko_customer_profiles_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_profiles_touch
  ON public.glatko_customer_profiles;
CREATE TRIGGER trg_customer_profiles_touch
  BEFORE UPDATE ON public.glatko_customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.glatko_customer_profiles_touch();

-- ─── 4. ensure_customer_profile RPC (idempotent upsert) ──────────────────

CREATE OR REPLACE FUNCTION public.glatko_ensure_customer_profile(
  p_user_id UUID,
  p_locale TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.glatko_customer_profiles (id, preferred_locale)
  VALUES (p_user_id, p_locale)
  ON CONFLICT (id) DO UPDATE SET
    preferred_locale = COALESCE(
      EXCLUDED.preferred_locale,
      public.glatko_customer_profiles.preferred_locale
    ),
    updated_at = NOW()
  RETURNING id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_ensure_customer_profile(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_ensure_customer_profile(UUID, TEXT)
  TO authenticated, service_role;

-- ─── 5. Founding Provider auto-flag trigger ──────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_check_founding_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_count INTEGER;
  v_limit INTEGER := 50;
  v_year2_start DATE := DATE '2027-05-01';
BEGIN
  -- Only trigger on transition INTO 'approved' (not from-approved updates)
  IF (OLD.verification_status IS NULL OR OLD.verification_status <> 'approved')
     AND NEW.verification_status = 'approved'
     AND COALESCE(NEW.is_founding_provider, false) = false THEN

    SELECT COUNT(*) INTO v_current_count
    FROM public.glatko_professional_profiles
    WHERE is_founding_provider = true;

    IF v_current_count < v_limit THEN
      NEW.is_founding_provider := true;
      NEW.founding_provider_at := NOW();
      NEW.founding_provider_number := v_current_count + 1;
      NEW.featured_until := v_year2_start + INTERVAL '3 months';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_founding_provider
  ON public.glatko_professional_profiles;
CREATE TRIGGER trg_check_founding_provider
  BEFORE UPDATE OF verification_status
  ON public.glatko_professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.glatko_check_founding_provider();

COMMENT ON FUNCTION public.glatko_check_founding_provider IS
'G-LAUNCH-1: auto-flags first 50 approved pros as founding. Trigger only on
transition INTO ''approved'' to avoid double-flagging.';

-- ─── 6. Founding Customer flag (called from server action post-submit) ──

CREATE OR REPLACE FUNCTION public.glatko_check_founding_customer(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_current_count INTEGER;
  v_limit INTEGER := 100;
  v_already_founding BOOLEAN;
  v_free_credits INTEGER := 5;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Make sure the customer profile exists first.
  PERFORM public.glatko_ensure_customer_profile(p_user_id, NULL);

  SELECT is_founding_customer INTO v_already_founding
  FROM public.glatko_customer_profiles
  WHERE id = p_user_id;

  IF v_already_founding THEN
    RETURN true;
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.glatko_customer_profiles
  WHERE is_founding_customer = true;

  IF v_current_count < v_limit THEN
    UPDATE public.glatko_customer_profiles
    SET is_founding_customer = true,
        founding_customer_at = NOW(),
        founding_customer_number = v_current_count + 1,
        free_credits = COALESCE(free_credits, 0) + v_free_credits,
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN true;
  END IF;

  RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_check_founding_customer(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_check_founding_customer(UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_check_founding_customer IS
'G-LAUNCH-1: idempotent — returns true if user is/becomes founding customer.
Flips is_founding_customer + grants 5 free credits when first 100 cap not yet hit.';

-- ─── 7. Public counters RPC (no admin gate, used by landing pages) ──────

CREATE OR REPLACE FUNCTION public.glatko_founding_counts()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pro_count INTEGER;
  v_cust_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_pro_count
  FROM public.glatko_professional_profiles
  WHERE is_founding_provider = true;

  SELECT COUNT(*) INTO v_cust_count
  FROM public.glatko_customer_profiles
  WHERE is_founding_customer = true;

  RETURN json_build_object(
    'provider_count', v_pro_count,
    'provider_limit', 50,
    'provider_remaining', GREATEST(50 - v_pro_count, 0),
    'customer_count', v_cust_count,
    'customer_limit', 100,
    'customer_remaining', GREATEST(100 - v_cust_count, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.glatko_founding_counts() TO anon, authenticated;

-- ─── 8. Launch metrics RPC (admin-only — full breakdown) ────────────────

CREATE OR REPLACE FUNCTION public.glatko_launch_metrics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT json_build_object(
    'founding_provider', json_build_object(
      'count', (
        SELECT COUNT(*) FROM public.glatko_professional_profiles
        WHERE is_founding_provider = true
      ),
      'limit', 50,
      'remaining', GREATEST(50 - (
        SELECT COUNT(*) FROM public.glatko_professional_profiles
        WHERE is_founding_provider = true
      ), 0)
    ),
    'founding_customer', json_build_object(
      'count', (
        SELECT COUNT(*) FROM public.glatko_customer_profiles
        WHERE is_founding_customer = true
      ),
      'limit', 100,
      'remaining', GREATEST(100 - (
        SELECT COUNT(*) FROM public.glatko_customer_profiles
        WHERE is_founding_customer = true
      ), 0)
    ),
    'pros_by_city', COALESCE((
      SELECT json_object_agg(location_city, cnt)
      FROM (
        SELECT location_city, COUNT(*) AS cnt
        FROM public.glatko_professional_profiles
        WHERE verification_status = 'approved'
          AND location_city IS NOT NULL
        GROUP BY location_city
      ) t
    ), '{}'::json),
    'pros_by_category', COALESCE((
      SELECT json_object_agg(c.slug, t.cnt)
      FROM (
        SELECT ps.category_id, COUNT(DISTINCT ps.professional_id) AS cnt
        FROM public.glatko_pro_services ps
        INNER JOIN public.glatko_professional_profiles p
          ON p.id = ps.professional_id
        WHERE p.verification_status = 'approved'
        GROUP BY ps.category_id
      ) t
      INNER JOIN public.glatko_service_categories c ON c.id = t.category_id
    ), '{}'::json),
    'requests_total', (SELECT COUNT(*) FROM public.glatko_service_requests),
    'requests_pending', (
      SELECT COUNT(*) FROM public.glatko_service_requests
      WHERE status = 'pending_moderation'
    ),
    'requests_published', (
      SELECT COUNT(*) FROM public.glatko_service_requests
      WHERE status IN ('published', 'active', 'bidding')
    ),
    'last_24h_signups', (
      SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '24 hours'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_launch_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_launch_metrics() TO authenticated;

COMMENT ON FUNCTION public.glatko_launch_metrics IS
'G-LAUNCH-1: admin dashboard JSON — counters, geographic + category
distribution of approved pros, request flow, last-24h signups.
Raises Forbidden when caller is not admin.';
