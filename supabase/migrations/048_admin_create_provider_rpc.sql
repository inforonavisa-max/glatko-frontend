-- ═══════════════════════════════════════════════════════════════════════════
-- G-ADMIN-PROVIDER-CREATE-01 migration 048: admin manual provider onboarding
-- ═══════════════════════════════════════════════════════════════════════════
-- Replaces the docs/operations/founding-majstor-template.sql copy-paste flow
-- with a callable RPC. Lets the admin UI submit a single payload and have
-- the database do all the work atomically (UPDATE profiles + INSERT
-- glatko_professional_profiles + INSERT glatko_pro_services), with the
-- pre-flight guards that the SQL template ran by hand.
--
-- The companion app code is /admin/providers/new and /admin/users/[id]/promote.
-- Both flows ultimately call public.glatko_admin_create_provider(jsonb).
--
-- DO NOT re-apply once it's in glatko-prod (CREATE OR REPLACE makes the
-- function idempotent; the index uses IF NOT EXISTS).
--
-- ── Concurrency safety: founding_provider_number race ────────────────────
--
-- If two admins promote concurrently with is_founding_provider=true, both
-- will compute the same MAX(founding_provider_number)+1 and try to insert
-- the same number. The partial unique index below rejects the second
-- insert with a clean unique_violation, surfaced to the UI as a
-- friendly error. The app retries by re-issuing the call (rare path).
--
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Partial unique index — race-safe founding numbering
CREATE UNIQUE INDEX IF NOT EXISTS glatko_pp_founding_number_unique
  ON public.glatko_professional_profiles (founding_provider_number)
  WHERE is_founding_provider = true;

-- 2. Atomic provider-create RPC
CREATE OR REPLACE FUNCTION public.glatko_admin_create_provider(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_user_id          uuid;
  v_expected_email   text;
  v_actual_email     text;
  v_slug             text;
  v_existing_slug_business text;
  v_is_founding      boolean;
  v_founding_number  int;
  v_verified_at      timestamptz;
  v_primary_count    int;
  v_service          jsonb;
BEGIN
  -- ─── Extract + basic shape guards ────────────────────────────────────
  v_user_id   := NULLIF(payload->>'user_id', '')::uuid;
  v_slug      := NULLIF(payload->>'slug', '');
  v_is_founding := COALESCE((payload->>'is_founding_provider')::boolean, false);
  v_expected_email := NULLIF(payload->>'expected_email', '');

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_id required', 'code', 'INVALID_INPUT');
  END IF;

  IF v_slug IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'slug required', 'code', 'INVALID_INPUT');
  END IF;

  IF jsonb_typeof(payload->'services') <> 'array'
     OR jsonb_array_length(payload->'services') < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'At least one service required', 'code', 'INVALID_INPUT');
  END IF;

  SELECT count(*) INTO v_primary_count
  FROM jsonb_array_elements(payload->'services') AS s
  WHERE (s->>'is_primary')::boolean = true;

  IF v_primary_count <> 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Exactly one primary service required (got %s)', v_primary_count),
      'code',    'INVALID_INPUT'
    );
  END IF;

  -- ─── Pre-flight: profile + email match ───────────────────────────────
  SELECT email INTO v_actual_email FROM public.profiles WHERE id = v_user_id;
  IF v_actual_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found for user_id', 'code', 'NOT_FOUND');
  END IF;

  IF v_expected_email IS NOT NULL AND v_actual_email <> v_expected_email THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Email mismatch: expected %s, got %s', v_expected_email, v_actual_email),
      'code',    'EMAIL_MISMATCH'
    );
  END IF;

  -- ─── Pre-flight: no duplicate pro profile ────────────────────────────
  IF EXISTS (SELECT 1 FROM public.glatko_professional_profiles WHERE id = v_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Provider profile already exists for this user',
      'code',    'DUPLICATE_PRO'
    );
  END IF;

  -- ─── Pre-flight: slug uniqueness ─────────────────────────────────────
  SELECT business_name INTO v_existing_slug_business
  FROM public.glatko_professional_profiles WHERE slug = v_slug;
  IF v_existing_slug_business IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   format('Slug already taken: %s (used by "%s")', v_slug, v_existing_slug_business),
      'code',    'DUPLICATE_SLUG'
    );
  END IF;

  -- ─── Compute founding number (race protected by partial unique index) ─
  IF v_is_founding THEN
    SELECT COALESCE(MAX(founding_provider_number), 0) + 1
    INTO v_founding_number
    FROM public.glatko_professional_profiles
    WHERE is_founding_provider = true;
  END IF;

  -- ─── Compute verified_at if marking verified ─────────────────────────
  IF COALESCE((payload->>'is_verified')::boolean, false) THEN
    v_verified_at := now();
  END IF;

  -- ─── Update profiles row (phone, city, full_name, locale, avatar) ────
  UPDATE public.profiles
  SET
    phone            = COALESCE(NULLIF(payload->>'phone', ''),            phone),
    city             = COALESCE(NULLIF(payload->>'city_display', ''),     city),
    full_name        = COALESCE(NULLIF(payload->>'full_name', ''),        full_name),
    preferred_locale = COALESCE(NULLIF(payload->>'preferred_locale', ''), preferred_locale),
    avatar_url       = COALESCE(NULLIF(payload->>'avatar_url', ''),       avatar_url),
    updated_at       = now()
  WHERE id = v_user_id;

  -- ─── Insert glatko_professional_profiles ─────────────────────────────
  INSERT INTO public.glatko_professional_profiles (
    id, business_name, slug, phone, bio,
    hourly_rate_min, hourly_rate_max, years_experience,
    location_city, service_radius_km, languages,
    is_verified, verified_at, is_active,
    verification_status, verification_tier,
    insurance_status, portfolio_images,
    is_founding_provider, founding_provider_at, founding_provider_number
  ) VALUES (
    v_user_id,
    NULLIF(payload->>'business_name', ''),
    v_slug,
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'bio', ''),
    NULLIF(payload->>'hourly_rate_min', '')::numeric,
    NULLIF(payload->>'hourly_rate_max', '')::numeric,
    NULLIF(payload->>'years_experience', '')::int,
    NULLIF(payload->>'location_city', ''),
    COALESCE(NULLIF(payload->>'service_radius_km', '')::int, 25),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(payload->'languages')),
      ARRAY['en']::text[]
    ),
    COALESCE((payload->>'is_verified')::boolean, false),
    v_verified_at,
    COALESCE((payload->>'is_active')::boolean, true),
    COALESCE(NULLIF(payload->>'verification_status', ''), 'pending'),
    COALESCE(NULLIF(payload->>'verification_tier', ''), 'basic')::verification_tier,
    COALESCE(NULLIF(payload->>'insurance_status', ''), 'none'),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(payload->'portfolio_images')),
      ARRAY[]::text[]
    ),
    v_is_founding,
    CASE WHEN v_is_founding THEN now() ELSE NULL END,
    v_founding_number
  );

  -- ─── Insert glatko_pro_services rows ─────────────────────────────────
  FOR v_service IN SELECT * FROM jsonb_array_elements(payload->'services')
  LOOP
    INSERT INTO public.glatko_pro_services (professional_id, category_id, is_primary)
    VALUES (
      v_user_id,
      (v_service->>'category_id')::uuid,
      COALESCE((v_service->>'is_primary')::boolean, false)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success',         true,
    'provider_id',     v_user_id,
    'founding_number', v_founding_number,
    'slug',            v_slug
  );

EXCEPTION
  WHEN unique_violation THEN
    -- Most likely the partial unique index on founding_provider_number
    -- (concurrent admins promoting two founding pros at the same time),
    -- or someone snuck a slug between our pre-flight check and INSERT.
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM,
      'code',    'UNIQUE_VIOLATION'
    );
  WHEN foreign_key_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Invalid foreign key: ' || SQLERRM,
      'code',    'FK_VIOLATION'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM,
      'code',    SQLSTATE
    );
END;
$function$;

-- 3. Restrict execute to authenticated callers; the server action also
-- enforces requireAdmin() at the app layer. SECURITY DEFINER means the
-- function runs as its owner (the migration runner), so it bypasses RLS;
-- the auth gate at the app layer is the one that matters.
REVOKE ALL ON FUNCTION public.glatko_admin_create_provider(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_admin_create_provider(jsonb) TO authenticated;
