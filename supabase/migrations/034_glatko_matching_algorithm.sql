-- ═══════════════════════════════════════════════════════════════════════════
-- G-REQ-2 Faz 2: Matching algorithm (Aday 3 — Distribution adil)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Five-component weighted score (sums to 1.00) + small random noise so
-- founding pros don't perpetually dominate identical-tier matches:
--
--   0.35 × profile_completion (0..1, normalized from 0..100 RPC)
--   0.35 × inverse_distance   (1.0 at 0 km, 0.0 at 50 km, NULL → 0.5 neutral)
--   0.10 × inverse_response   (1.0 at 0s, 0.0 at 24h, NULL → 0.5 neutral)
--   0.10 × rating             (avg_rating / 5, NULL → 0.5 neutral)
--   0.10 × pricing            (1.0 at median, falls off linearly to ±100% delta)
--   + RANDOM(0..0.05)         (fair-rotation noise for top-tier ties)
--
-- Geo gate: pro is dropped if distance > service_radius_km.
--
-- RPCs delivered:
--   glatko_get_request_matches(req, limit, primary_count) — ranked list
--   glatko_dispatch_request_notifications(req)            — Top 3 + 7 wait-list
--   glatko_activate_waitlist(req)                         — 30-min cron worker
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. PostGIS + location_point columns ──────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;

DO $$
BEGIN
  ALTER TABLE public.glatko_professional_profiles
    ADD COLUMN IF NOT EXISTS location_point extensions.geography(POINT, 4326);
  ALTER TABLE public.glatko_service_requests
    ADD COLUMN IF NOT EXISTS location_point extensions.geography(POINT, 4326);
END $$;

CREATE INDEX IF NOT EXISTS idx_pro_location_point
  ON public.glatko_professional_profiles USING gist(location_point);
CREATE INDEX IF NOT EXISTS idx_request_location_point
  ON public.glatko_service_requests USING gist(location_point);

-- ─── 2. Backfill Boka Bay 3 cities (soft-launch geo) ──────────────────────

UPDATE public.glatko_professional_profiles
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.8467, 42.2864), 4326)::geography
WHERE location_city ILIKE 'Budva' AND location_point IS NULL;

UPDATE public.glatko_professional_profiles
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.7714, 42.4247), 4326)::geography
WHERE location_city ILIKE 'Kotor' AND location_point IS NULL;

UPDATE public.glatko_professional_profiles
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.6960, 42.4347), 4326)::geography
WHERE location_city ILIKE 'Tivat' AND location_point IS NULL;

UPDATE public.glatko_service_requests
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.8467, 42.2864), 4326)::geography
WHERE municipality ILIKE 'Budva' AND location_point IS NULL;

UPDATE public.glatko_service_requests
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.7714, 42.4247), 4326)::geography
WHERE municipality ILIKE 'Kotor' AND location_point IS NULL;

UPDATE public.glatko_service_requests
SET location_point = extensions.ST_SetSRID(extensions.ST_MakePoint(18.6960, 42.4347), 4326)::geography
WHERE municipality ILIKE 'Tivat' AND location_point IS NULL;

-- ─── 3. Matching algorithm RPC ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_get_request_matches(
  p_request_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_primary_count INTEGER DEFAULT 3
)
RETURNS TABLE (
  professional_id UUID,
  business_name TEXT,
  match_score NUMERIC,
  match_rank INTEGER,
  is_primary BOOLEAN,
  distance_km NUMERIC,
  profile_completion INTEGER,
  service_radius_km INTEGER,
  avg_response_time_seconds INTEGER,
  rating NUMERIC,
  hourly_rate_min NUMERIC,
  hourly_rate_max NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_category_id UUID;
  v_request_location extensions.geography;
  v_median_rate NUMERIC;
BEGIN
  SELECT sr.category_id, sr.location_point
  INTO v_request_category_id, v_request_location
  FROM public.glatko_service_requests sr
  WHERE sr.id = p_request_id;

  IF v_request_category_id IS NULL THEN
    RAISE EXCEPTION 'Request % not found or has no category', p_request_id;
  END IF;

  -- Median hourly rate of pros in this category (for pricing component)
  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.hourly_rate_min)
  INTO v_median_rate
  FROM public.glatko_professional_profiles p
  INNER JOIN public.glatko_pro_services ps ON ps.professional_id = p.id
  WHERE ps.category_id = v_request_category_id
    AND p.verification_status = 'approved'
    AND p.hourly_rate_min IS NOT NULL;

  v_median_rate := COALESCE(v_median_rate, 30);  -- soft-launch fallback

  RETURN QUERY
  WITH candidate_pros AS (
    SELECT
      p.id AS pro_id,
      p.business_name AS biz_name,
      p.location_point AS loc_point,
      p.service_radius_km AS radius_km,
      p.hourly_rate_min AS rate_min,
      p.hourly_rate_max AS rate_max,
      p.avg_rating AS rating_value,
      CASE
        WHEN v_request_location IS NULL OR p.location_point IS NULL THEN NULL
        ELSE extensions.ST_Distance(p.location_point, v_request_location) / 1000.0
      END AS dist_km,
      COALESCE(
        public.glatko_calculate_profile_completion(p.id),
        50
      ) AS pcompletion,
      prm.avg_response_time_seconds AS arts
    FROM public.glatko_professional_profiles p
    INNER JOIN public.glatko_pro_services ps ON ps.professional_id = p.id
    LEFT JOIN public.glatko_pro_response_metrics prm
      ON prm.professional_id = p.id
    WHERE ps.category_id = v_request_category_id
      AND p.verification_status = 'approved'
  ),
  scored_pros AS (
    SELECT
      cp.*,
      (
        cp.dist_km IS NULL
        OR cp.dist_km <= COALESCE(cp.radius_km, 50)
      ) AS geo_match,
      (
        0.35 * (cp.pcompletion::NUMERIC / 100.0)
        + 0.35 * CASE
            WHEN cp.dist_km IS NULL THEN 0.5
            WHEN cp.dist_km > 50 THEN 0.0
            ELSE 1.0 - (cp.dist_km / 50.0)
          END
        + 0.10 * CASE
            WHEN cp.arts IS NULL THEN 0.5
            WHEN cp.arts > 86400 THEN 0.0
            ELSE 1.0 - (cp.arts::NUMERIC / 86400.0)
          END
        + 0.10 * COALESCE(cp.rating_value / 5.0, 0.5)
        + 0.10 * CASE
            WHEN cp.rate_min IS NULL THEN 0.5
            ELSE 1.0 - LEAST(
              ABS(cp.rate_min - v_median_rate) / NULLIF(v_median_rate, 0),
              1.0
            )
          END
        + (RANDOM() * 0.05)
      ) AS raw_score
    FROM candidate_pros cp
  ),
  final_ranked AS (
    SELECT
      sp.pro_id,
      sp.biz_name,
      sp.dist_km,
      sp.pcompletion,
      sp.radius_km,
      sp.arts,
      sp.rating_value,
      sp.rate_min,
      sp.rate_max,
      sp.raw_score,
      ROW_NUMBER() OVER (ORDER BY sp.raw_score DESC) AS rnk
    FROM scored_pros sp
    WHERE sp.geo_match
  )
  SELECT
    fr.pro_id::UUID,
    fr.biz_name::TEXT,
    fr.raw_score::NUMERIC,
    fr.rnk::INTEGER,
    (fr.rnk <= p_primary_count)::BOOLEAN,
    fr.dist_km::NUMERIC,
    fr.pcompletion::INTEGER,
    fr.radius_km::INTEGER,
    fr.arts::INTEGER,
    fr.rating_value::NUMERIC,
    fr.rate_min::NUMERIC,
    fr.rate_max::NUMERIC
  FROM final_ranked fr
  WHERE fr.rnk <= p_limit
  ORDER BY fr.rnk;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_get_request_matches(UUID, INTEGER, INTEGER)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_get_request_matches(UUID, INTEGER, INTEGER)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_get_request_matches IS
'G-REQ-2 Aday 3 algorithm: weighted score over 5 axes + tiny random
fair-rotation noise. Returns ranked list capped at p_limit; first
p_primary_count flagged is_primary=true (Top 3 by default).';

-- ─── 4. Notification dispatch RPC ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.glatko_dispatch_request_notifications(
  p_request_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_match RECORD;
  v_notified_count INTEGER := 0;
  v_waitlist_count INTEGER := 0;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Idempotent: clear any prior notification rows for this request
  DELETE FROM public.glatko_request_notifications
  WHERE request_id = p_request_id;

  FOR v_match IN
    SELECT *
    FROM public.glatko_get_request_matches(p_request_id, 10, 3)
  LOOP
    INSERT INTO public.glatko_request_notifications (
      request_id, professional_id, match_score, match_rank,
      is_primary, notified_at
    ) VALUES (
      p_request_id,
      v_match.professional_id,
      v_match.match_score,
      v_match.match_rank,
      v_match.is_primary,
      CASE WHEN v_match.is_primary THEN v_now ELSE NULL END
    );

    -- Bump pro's notification counter
    INSERT INTO public.glatko_pro_response_metrics (
      professional_id, total_notifications
    ) VALUES (v_match.professional_id, 1)
    ON CONFLICT (professional_id) DO UPDATE SET
      total_notifications = glatko_pro_response_metrics.total_notifications + 1,
      updated_at = v_now;

    IF v_match.is_primary THEN
      v_notified_count := v_notified_count + 1;
    ELSE
      v_waitlist_count := v_waitlist_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'request_id', p_request_id,
    'notified_count', v_notified_count,
    'waitlist_count', v_waitlist_count,
    'total_matches', v_notified_count + v_waitlist_count,
    'dispatched_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_dispatch_request_notifications(UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_dispatch_request_notifications(UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_dispatch_request_notifications IS
'G-REQ-2: queues match results into glatko_request_notifications.
Top 3 get notified_at = NOW() (the email worker reads these). Wait-list
7 stay with notified_at = NULL until glatko_activate_waitlist flips them.
Idempotent — re-running clears prior queue entries first.';

-- ─── 5. Wait-list activation RPC (called by 30-min cron) ──────────────────

CREATE OR REPLACE FUNCTION public.glatko_activate_waitlist(
  p_request_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote_count INTEGER;
  v_activated_count INTEGER := 0;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT COUNT(*) INTO v_quote_count
  FROM public.glatko_request_quotes
  WHERE request_id = p_request_id;

  IF v_quote_count >= 3 THEN
    RETURN json_build_object(
      'request_id', p_request_id,
      'activated', false,
      'reason', 'sufficient_quotes_received',
      'quote_count', v_quote_count
    );
  END IF;

  UPDATE public.glatko_request_notifications
  SET notified_at = v_now
  WHERE request_id = p_request_id
    AND notified_at IS NULL
    AND is_primary = false;

  GET DIAGNOSTICS v_activated_count = ROW_COUNT;

  RETURN json_build_object(
    'request_id', p_request_id,
    'activated', true,
    'waitlist_activated_count', v_activated_count,
    'existing_quotes', v_quote_count,
    'activated_at', v_now
  );
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_activate_waitlist(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_activate_waitlist(UUID)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_activate_waitlist IS
'G-REQ-2: cron worker calls this 30 min post-dispatch. If <3 quotes have
landed, flips the wait-list 7 to notified_at=NOW() so the email worker
sends them out. Idempotent — re-runs are no-ops once 3 quotes exist.';

-- ─── 6. Cron helper: find requests needing wait-list activation ───────────

CREATE OR REPLACE FUNCTION public.glatko_find_pending_waitlist_activations(
  p_min_age_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  request_id UUID,
  dispatched_at TIMESTAMPTZ,
  primary_notified_count INTEGER,
  quote_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    rn.request_id,
    MIN(rn.notified_at) AS dispatched_at,
    COUNT(*) FILTER (WHERE rn.is_primary AND rn.notified_at IS NOT NULL)::INTEGER
      AS primary_notified_count,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.glatko_request_quotes q
      WHERE q.request_id = rn.request_id
    ) AS quote_count
  FROM public.glatko_request_notifications rn
  WHERE EXISTS (
    SELECT 1 FROM public.glatko_request_notifications rn2
    WHERE rn2.request_id = rn.request_id
      AND rn2.is_primary = false
      AND rn2.notified_at IS NULL
  )
  GROUP BY rn.request_id
  HAVING MIN(rn.notified_at) < (NOW() - (p_min_age_minutes || ' minutes')::INTERVAL)
     AND (
       SELECT COUNT(*) FROM public.glatko_request_quotes q
       WHERE q.request_id = rn.request_id
     ) < 3;
$$;

REVOKE ALL ON FUNCTION public.glatko_find_pending_waitlist_activations(INTEGER)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_find_pending_waitlist_activations(INTEGER)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_find_pending_waitlist_activations IS
'G-REQ-2 cron support: lists request IDs whose primary dispatch is at
least p_min_age_minutes old AND have <3 quotes AND still have
unnotified wait-list rows. Cron iterates over results and calls
glatko_activate_waitlist on each.';
