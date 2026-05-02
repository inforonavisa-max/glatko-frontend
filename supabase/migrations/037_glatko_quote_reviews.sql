-- ═══════════════════════════════════════════════════════════════════════════
-- G-REV-1: Quote-based review system + completion state machine
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Workflow (Airbnb pattern):
--   1. Pro marks quote complete (in_progress → pro_marked_complete)
--   2. Customer confirms (→ customer_confirmed) or disputes (→ customer_disputed)
--   3. Customer submits a 1–5 star review (+ optional comment)
--   4. Trigger refreshes pro's avg_rating + completed_jobs cache
--
-- Schema collision avoidance: the legacy glatko_reviews table is
-- bid_id-based (multi-axis ratings: overall/quality/communication/
-- punctuality) and is still wired into the bid-era code in
-- lib/supabase/glatko.server.ts + /review/[requestId]/page.tsx. We
-- ship a NEW table glatko_quote_reviews tied to the G-REQ-2 quotes
-- flow so the two systems coexist without a column collision.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Completion state on glatko_request_quotes ──────────────────────────

ALTER TABLE public.glatko_request_quotes
  ADD COLUMN IF NOT EXISTS completion_state TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (completion_state IN (
      'in_progress',
      'pro_marked_complete',
      'customer_confirmed',
      'customer_disputed',
      'cancelled'
    )),
  ADD COLUMN IF NOT EXISTS pro_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_disputed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_quotes_completion_state
  ON public.glatko_request_quotes (completion_state)
  WHERE completion_state IN ('pro_marked_complete', 'customer_confirmed');

COMMENT ON COLUMN public.glatko_request_quotes.completion_state IS
'G-REV-1 state machine: in_progress (default) → pro_marked_complete →
customer_confirmed (review unlocks) | customer_disputed (Year 2
workflow). cancelled is the manual abort path.';

-- ─── 2. Reviews ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_quote_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  quote_id UUID NOT NULL
    REFERENCES public.glatko_request_quotes(id) ON DELETE CASCADE,
  request_id UUID NOT NULL
    REFERENCES public.glatko_service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT CHECK (comment IS NULL OR length(comment) BETWEEN 0 AND 1000),

  -- Anonymized public name ("John D." style); resolved server-side
  -- from profiles.full_name at insert time so RLS-restricted readers
  -- can render names without joining to profiles.
  customer_display_name TEXT,

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'flagged', 'removed')),

  -- Pro can respond (Year 2 — column reserved now to avoid a later
  -- ALTER on a populated table).
  pro_response TEXT,
  pro_response_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (quote_id)
);

CREATE INDEX IF NOT EXISTS idx_quote_reviews_pro
  ON public.glatko_quote_reviews (professional_id, created_at DESC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_quote_reviews_customer
  ON public.glatko_quote_reviews (customer_id, created_at DESC);

COMMENT ON TABLE public.glatko_quote_reviews IS
'G-REV-1: customer review on a completed quote. Distinct from legacy
glatko_reviews (bid_id-based, multi-axis) which the bid /inbox/ flow
still uses. UNIQUE(quote_id) enforces "one review per job".';

-- ─── 3. RLS ────────────────────────────────────────────────────────────────

ALTER TABLE public.glatko_quote_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quote reviews: public read"
  ON public.glatko_quote_reviews;
CREATE POLICY "Quote reviews: public read" ON public.glatko_quote_reviews
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Quote reviews: customer insert"
  ON public.glatko_quote_reviews;
CREATE POLICY "Quote reviews: customer insert" ON public.glatko_quote_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.glatko_request_quotes q
      WHERE q.id = quote_id
        AND q.completion_state = 'customer_confirmed'
    )
  );

-- 30-day edit window after creation.
DROP POLICY IF EXISTS "Quote reviews: customer update own"
  ON public.glatko_quote_reviews;
CREATE POLICY "Quote reviews: customer update own"
  ON public.glatko_quote_reviews
  FOR UPDATE USING (
    auth.uid() = customer_id
    AND created_at > NOW() - INTERVAL '30 days'
  );

DROP POLICY IF EXISTS "Quote reviews: admin all"
  ON public.glatko_quote_reviews;
CREATE POLICY "Quote reviews: admin all" ON public.glatko_quote_reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── 4. updated_at touch ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_quote_reviews_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quote_reviews_touch
  ON public.glatko_quote_reviews;
CREATE TRIGGER trg_quote_reviews_touch
  BEFORE UPDATE ON public.glatko_quote_reviews
  FOR EACH ROW EXECUTE FUNCTION public.glatko_quote_reviews_touch();

-- ─── 5. Trigger: review write → pro avg_rating + completed_jobs cache ─────

CREATE OR REPLACE FUNCTION public.glatko_update_pro_rating_from_quote_reviews()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pro_id UUID := COALESCE(NEW.professional_id, OLD.professional_id);
BEGIN
  UPDATE public.glatko_professional_profiles
  SET
    avg_rating = COALESCE((
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM public.glatko_quote_reviews
      WHERE professional_id = v_pro_id
        AND status = 'published'
    ), 0),
    completed_jobs = (
      SELECT COUNT(*)
      FROM public.glatko_request_quotes
      WHERE professional_id = v_pro_id
        AND completion_state = 'customer_confirmed'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.glatko_quote_reviews
      WHERE professional_id = v_pro_id
        AND status = 'published'
    ),
    updated_at = NOW()
  WHERE id = v_pro_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_pro_rating_from_quote_reviews
  ON public.glatko_quote_reviews;
CREATE TRIGGER trg_update_pro_rating_from_quote_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.glatko_quote_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.glatko_update_pro_rating_from_quote_reviews();

-- ─── 6. RPC: Pro marks quote complete ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_pro_mark_complete(
  p_quote_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pro_id UUID;
  v_state TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT professional_id, completion_state
  INTO v_pro_id, v_state
  FROM public.glatko_request_quotes
  WHERE id = p_quote_id;

  IF v_pro_id IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  IF v_pro_id <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden: not quote owner';
  END IF;
  IF v_state <> 'in_progress' THEN
    RAISE EXCEPTION 'Cannot mark complete from state: %', v_state;
  END IF;

  UPDATE public.glatko_request_quotes
  SET completion_state = 'pro_marked_complete',
      pro_completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_quote_id
    AND completion_state = 'in_progress';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_pro_mark_complete(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_pro_mark_complete(UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_pro_mark_complete IS
'G-REV-1: pro flips a quote from in_progress → pro_marked_complete.
Caller must be the quote''s pro; raises Forbidden otherwise. Idempotent
on retried calls (the in_progress filter enforces single-shot).';

-- ─── 7. RPC: Customer confirm or dispute ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_customer_confirm_completion(
  p_quote_id UUID,
  p_confirmed BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_customer_id UUID;
  v_state TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT sr.customer_id, q.completion_state
  INTO v_customer_id, v_state
  FROM public.glatko_request_quotes q
  INNER JOIN public.glatko_service_requests sr ON sr.id = q.request_id
  WHERE q.id = p_quote_id;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Quote not found or anonymous';
  END IF;
  IF v_customer_id <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden: not request owner';
  END IF;
  IF v_state <> 'pro_marked_complete' THEN
    RAISE EXCEPTION 'Cannot confirm from state: %', v_state;
  END IF;

  UPDATE public.glatko_request_quotes
  SET completion_state = CASE
        WHEN p_confirmed THEN 'customer_confirmed'
        ELSE 'customer_disputed'
      END,
      customer_confirmed_at = CASE WHEN p_confirmed THEN NOW() ELSE NULL END,
      customer_disputed_at = CASE WHEN NOT p_confirmed THEN NOW() ELSE NULL END,
      updated_at = NOW()
  WHERE id = p_quote_id
    AND completion_state = 'pro_marked_complete';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_customer_confirm_completion(UUID, BOOLEAN)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_customer_confirm_completion(UUID, BOOLEAN)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_customer_confirm_completion IS
'G-REV-1: customer flips pro_marked_complete → customer_confirmed (when
true) or customer_disputed (when false). Confirm unlocks review insert
via the RLS policy. Idempotent — only fires when state still matches.';

COMMIT;
