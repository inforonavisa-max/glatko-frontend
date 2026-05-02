-- ═══════════════════════════════════════════════════════════════════════════
-- G-REQ-2 Faz 1: Request quotes + response metrics + notification queue
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Three new tables that together turn an approved service request into a
-- bid loop:
--
--   glatko_request_quotes       — pro's actual offer (price + message)
--   glatko_pro_response_metrics — aggregate response-time stats per pro
--                                 (drives the matching algorithm's
--                                 inverse_response_time component)
--   glatko_request_notifications — queue of which pros got matched and
--                                  whether they were notified or
--                                  parked on the wait-list (Top 3 +
--                                  7 wait-list strategy)
--
-- Wait-list rationale: only the top 3 pros get the immediate ping. If
-- 30 minutes pass and we have <3 quotes, the cron job activates the
-- next 7 (notified_at flips from NULL to now()). Keeps signal/noise
-- high for top pros without starving the customer of options.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Request quotes ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_request_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL
    REFERENCES public.glatko_service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,

  price_amount NUMERIC(10, 2) NOT NULL CHECK (price_amount >= 0),
  price_currency TEXT NOT NULL DEFAULT 'EUR',
  pricing_model TEXT NOT NULL
    CHECK (pricing_model IN ('hourly', 'fixed', 'per_unit', 'estimate')),
  message TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 5000),

  notified_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_time_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (submitted_at - notified_at))::INTEGER
  ) STORED,

  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'accepted', 'rejected', 'expired')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (request_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_quotes_request
  ON public.glatko_request_quotes (request_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_pro
  ON public.glatko_request_quotes (professional_id, submitted_at DESC);

COMMENT ON TABLE public.glatko_request_quotes IS
'G-REQ-2: pro''s offer on a service request. UNIQUE(request_id,
professional_id) enforces one quote per pro per request — pros edit by
UPDATE, not double-INSERT. response_time_seconds is GENERATED so the
matching algorithm can read it without a JOIN.';

-- ─── 2. Pro response metrics ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_pro_response_metrics (
  professional_id UUID PRIMARY KEY
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,

  total_notifications INTEGER NOT NULL DEFAULT 0
    CHECK (total_notifications >= 0),
  total_quotes_sent INTEGER NOT NULL DEFAULT 0
    CHECK (total_quotes_sent >= 0),

  avg_response_time_seconds INTEGER,
  median_response_time_seconds INTEGER,
  fastest_response_seconds INTEGER,

  last_quote_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.glatko_pro_response_metrics IS
'G-REQ-2: aggregate response stats per pro. Updated by trigger on
glatko_request_quotes INSERT. Read by the matching algorithm to score
pros — faster average response = higher inverse_response_time component.';

-- ─── 3. Request notifications queue ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.glatko_request_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL
    REFERENCES public.glatko_service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL
    REFERENCES public.glatko_professional_profiles(id) ON DELETE CASCADE,

  match_score NUMERIC(5, 4) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  match_rank INTEGER NOT NULL CHECK (match_rank >= 1),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,

  notified_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  quote_id UUID REFERENCES public.glatko_request_quotes(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (request_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_request_notifications_request
  ON public.glatko_request_notifications (request_id, is_primary, match_rank);
CREATE INDEX IF NOT EXISTS idx_request_notifications_waitlist
  ON public.glatko_request_notifications (request_id, notified_at)
  WHERE notified_at IS NULL;

COMMENT ON TABLE public.glatko_request_notifications IS
'G-REQ-2: queue of pros matched to a request. is_primary=true → top 3
notified immediately on dispatch. is_primary=false → wait-list (notified_at
NULL until cron flips them after 30 min if quote count <3). quote_id is
backfilled by the quote-insert trigger so we can join queue → quote in
one read.';

-- ─── 4. RLS ────────────────────────────────────────────────────────────────

ALTER TABLE public.glatko_request_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glatko_pro_response_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glatko_request_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pros read own quotes" ON public.glatko_request_quotes;
CREATE POLICY "Pros read own quotes" ON public.glatko_request_quotes
  FOR SELECT USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Pros insert own quotes" ON public.glatko_request_quotes;
CREATE POLICY "Pros insert own quotes" ON public.glatko_request_quotes
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Pros update own quotes" ON public.glatko_request_quotes;
CREATE POLICY "Pros update own quotes" ON public.glatko_request_quotes
  FOR UPDATE USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Customers read own request quotes"
  ON public.glatko_request_quotes;
CREATE POLICY "Customers read own request quotes" ON public.glatko_request_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.glatko_service_requests sr
      WHERE sr.id = request_id
        AND (
          sr.customer_id = auth.uid()
          OR sr.anonymous_email = (auth.jwt() ->> 'email')
        )
    )
  );

DROP POLICY IF EXISTS "Admin all quotes" ON public.glatko_request_quotes;
CREATE POLICY "Admin all quotes" ON public.glatko_request_quotes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Pros read own metrics"
  ON public.glatko_pro_response_metrics;
CREATE POLICY "Pros read own metrics" ON public.glatko_pro_response_metrics
  FOR SELECT USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Admin all metrics"
  ON public.glatko_pro_response_metrics;
CREATE POLICY "Admin all metrics" ON public.glatko_pro_response_metrics
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Pros read own notifications"
  ON public.glatko_request_notifications;
CREATE POLICY "Pros read own notifications" ON public.glatko_request_notifications
  FOR SELECT USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Admin all notifications"
  ON public.glatko_request_notifications;
CREATE POLICY "Admin all notifications" ON public.glatko_request_notifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ─── 5. updated_at trigger for quotes ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_request_quotes_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_request_quotes_touch ON public.glatko_request_quotes;
CREATE TRIGGER trg_request_quotes_touch
  BEFORE UPDATE ON public.glatko_request_quotes
  FOR EACH ROW EXECUTE FUNCTION public.glatko_request_quotes_touch();

-- ─── 6. Quote insert → response metrics + notification.quote_id link ──────

CREATE OR REPLACE FUNCTION public.glatko_update_pro_response_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Upsert metrics row
  INSERT INTO public.glatko_pro_response_metrics (
    professional_id,
    total_quotes_sent,
    avg_response_time_seconds,
    median_response_time_seconds,
    fastest_response_seconds,
    last_quote_at,
    updated_at
  ) VALUES (
    NEW.professional_id,
    1,
    NEW.response_time_seconds,
    NEW.response_time_seconds,
    NEW.response_time_seconds,
    NEW.submitted_at,
    NOW()
  )
  ON CONFLICT (professional_id) DO UPDATE SET
    total_quotes_sent = glatko_pro_response_metrics.total_quotes_sent + 1,
    avg_response_time_seconds = (
      SELECT AVG(response_time_seconds)::INTEGER
      FROM public.glatko_request_quotes
      WHERE professional_id = NEW.professional_id
    ),
    median_response_time_seconds = (
      SELECT (
        PERCENTILE_CONT(0.5)
          WITHIN GROUP (ORDER BY response_time_seconds)
      )::INTEGER
      FROM public.glatko_request_quotes
      WHERE professional_id = NEW.professional_id
    ),
    fastest_response_seconds = LEAST(
      glatko_pro_response_metrics.fastest_response_seconds,
      NEW.response_time_seconds
    ),
    last_quote_at = NEW.submitted_at,
    updated_at = NOW();

  -- Backfill the matching notification with the new quote id so the
  -- queue → quote join is single-table-read.
  UPDATE public.glatko_request_notifications
  SET quote_id = NEW.id
  WHERE request_id = NEW.request_id
    AND professional_id = NEW.professional_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_response_metrics
  ON public.glatko_request_quotes;
CREATE TRIGGER trg_update_response_metrics
  AFTER INSERT ON public.glatko_request_quotes
  FOR EACH ROW EXECUTE FUNCTION public.glatko_update_pro_response_metrics();
