-- ═══════════════════════════════════════════════════════════════════════════
-- G-MSG-2: AI translation cache (gpt-4o)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Customer↔pro chat traffic spans 9 locales; whenever the recipient's
-- preferred_locale differs from the message body_locale we run a
-- gpt-4o translation. The cache table dedupes by SHA256(source_locale +
-- target_locale + body) so the same phrase is never translated twice
-- (founding-launch comms have a high overlap of "available this weekend?"
-- style phrases).
--
-- profiles.preferred_locale already exists from earlier sprints, so this
-- migration only adds the cache table + lookup/save RPCs.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.glatko_translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source_text TEXT NOT NULL,
  source_locale TEXT NOT NULL,
  target_locale TEXT NOT NULL,
  translated_text TEXT NOT NULL,

  model TEXT NOT NULL DEFAULT 'gpt-4o',
  token_input INTEGER CHECK (token_input IS NULL OR token_input >= 0),
  token_output INTEGER CHECK (token_output IS NULL OR token_output >= 0),
  cost_usd NUMERIC(10, 6) CHECK (cost_usd IS NULL OR cost_usd >= 0),

  -- SHA256(source_locale + '|' + target_locale + '|' + source_text), 32 hex chars
  cache_key TEXT NOT NULL UNIQUE,
  hit_count INTEGER NOT NULL DEFAULT 1 CHECK (hit_count >= 1),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_locales
  ON public.glatko_translation_cache (source_locale, target_locale);
CREATE INDEX IF NOT EXISTS idx_translation_cache_recent
  ON public.glatko_translation_cache (last_used_at DESC);

COMMENT ON TABLE public.glatko_translation_cache IS
'G-MSG-2: gpt-4o translation cache. cache_key is the unique lookup
(SHA256 of locale pair + source text). hit_count + last_used_at let us
audit cost and prune cold entries later.';

-- ─── RLS ──────────────────────────────────────────────────────────────────
-- Cache is internal: admin reads for cost auditing, service_role writes
-- via the RPCs below.

ALTER TABLE public.glatko_translation_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Translation cache: admin read"
  ON public.glatko_translation_cache;
CREATE POLICY "Translation cache: admin read"
  ON public.glatko_translation_cache
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Translation cache: admin all"
  ON public.glatko_translation_cache;
CREATE POLICY "Translation cache: admin all"
  ON public.glatko_translation_cache
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Lookup RPC ───────────────────────────────────────────────────────────
-- Atomic SELECT + UPDATE: bumps hit_count + last_used_at AND returns
-- the cached translation in one round-trip. STABLE so callers know it
-- doesn't mutate request state in unexpected ways (the side-effect is
-- bookkeeping only, not user-visible state).

CREATE OR REPLACE FUNCTION public.glatko_lookup_translation(
  p_cache_key TEXT
)
RETURNS TABLE (translated_text TEXT, model TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.glatko_translation_cache
  SET hit_count = hit_count + 1,
      last_used_at = NOW()
  WHERE cache_key = p_cache_key
  RETURNING glatko_translation_cache.translated_text,
            glatko_translation_cache.model;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_lookup_translation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_lookup_translation(TEXT)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.glatko_lookup_translation IS
'G-MSG-2: cache hit path. UPDATE … RETURNING bumps hit_count + last_used_at
and yields the translation in a single statement. Returns 0 rows on miss.';

-- ─── Save RPC ─────────────────────────────────────────────────────────────
-- ON CONFLICT(cache_key) keeps the original translation (don't clobber
-- with a possibly-different-but-newer gpt-4o output) but bumps hit_count.

CREATE OR REPLACE FUNCTION public.glatko_save_translation(
  p_source_text TEXT,
  p_source_locale TEXT,
  p_target_locale TEXT,
  p_translated_text TEXT,
  p_model TEXT,
  p_token_input INTEGER,
  p_token_output INTEGER,
  p_cost_usd NUMERIC,
  p_cache_key TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.glatko_translation_cache (
    source_text, source_locale, target_locale,
    translated_text, model, token_input, token_output,
    cost_usd, cache_key
  ) VALUES (
    p_source_text, p_source_locale, p_target_locale,
    p_translated_text, p_model, p_token_input, p_token_output,
    p_cost_usd, p_cache_key
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    hit_count = glatko_translation_cache.hit_count + 1,
    last_used_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_save_translation(
  TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, NUMERIC, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_save_translation(
  TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, NUMERIC, TEXT
) TO service_role;

COMMENT ON FUNCTION public.glatko_save_translation IS
'G-MSG-2: cache write path. service_role only. INSERT … ON CONFLICT
preserves the first translation and increments hit_count on duplicates
(translation is deterministic enough that re-translating just wastes
tokens).';

-- ─── profiles.preferred_locale safety net ─────────────────────────────────
-- Column already exists from earlier sprints; this DO block is a no-op
-- on the live DB but documents the dependency for fresh installs.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'preferred_locale'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_locale TEXT;
  END IF;
END $$;

COMMIT;
