-- ============================================================================
-- 014_glatko_search_infrastructure.sql
-- G-CAT-3: Premium search infra (pg_trgm + unaccent + tsvector + RPC)
--
-- Sections:
--   1. Extensions: pg_trgm, unaccent, btree_gin in 'extensions' schema
--   2. glatko_service_categories.search_text computed column + GIN index
--   3. glatko_professional_profiles.search_text computed column + GIN index
--   4. glatko_search_synonyms table for sectoral jargon expansion (9 langs)
--   5. glatko_user_recent_searches table (RLS owner-only)
--   6. glatko_search RPC: hybrid categories + professionals fuzzy search
--   7. glatko_trending_categories RPC: empty-state P0 list
--
-- Schema notes (verified against 001_glatko_foundation.sql):
--   - glatko_professional_profiles real columns:
--       business_name TEXT, bio TEXT, location_city TEXT,
--       is_active BOOLEAN, is_verified BOOLEAN,
--       avg_rating DECIMAL(3,2), total_reviews INT,
--       portfolio_images TEXT[]
--     (no short_description/long_description/cities_served/slug)
--   - We synthesize search_text from business_name + bio + location_city
--   - Hero image: portfolio_images[1] when present, else NULL
--   - Pro "slug" for routing: id::TEXT (route is /pro/[id])
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Extensions (Supabase recommends 'extensions' schema)
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pg_trgm  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA extensions;

-- unaccent must be IMMUTABLE for use in a generated column. The default
-- unaccent(text) is STABLE; wrap it in an IMMUTABLE SQL helper.
CREATE OR REPLACE FUNCTION public.glatko_unaccent_immutable(t TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT extensions.unaccent('extensions.unaccent'::regdictionary, t);
$$;

-- ----------------------------------------------------------------------------
-- 2. Categories search_text (concat of all 9-locale name + description)
-- ----------------------------------------------------------------------------

ALTER TABLE public.glatko_service_categories
  ADD COLUMN IF NOT EXISTS search_text TEXT GENERATED ALWAYS AS (
    public.glatko_unaccent_immutable(lower(
      coalesce(name->>'me','') || ' ' ||
      coalesce(name->>'sr','') || ' ' ||
      coalesce(name->>'en','') || ' ' ||
      coalesce(name->>'tr','') || ' ' ||
      coalesce(name->>'de','') || ' ' ||
      coalesce(name->>'it','') || ' ' ||
      coalesce(name->>'ru','') || ' ' ||
      coalesce(name->>'ar','') || ' ' ||
      coalesce(name->>'uk','') || ' ' ||
      coalesce(description->>'me','') || ' ' ||
      coalesce(description->>'sr','') || ' ' ||
      coalesce(description->>'en','') || ' ' ||
      coalesce(description->>'tr','') || ' ' ||
      coalesce(description->>'de','') || ' ' ||
      coalesce(description->>'it','') || ' ' ||
      coalesce(description->>'ru','') || ' ' ||
      coalesce(description->>'ar','') || ' ' ||
      coalesce(description->>'uk','')
    ))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_glatko_categories_search_trgm
  ON public.glatko_service_categories
  USING gin (search_text extensions.gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 3. Professional profiles search_text (real schema)
-- ----------------------------------------------------------------------------

ALTER TABLE public.glatko_professional_profiles
  ADD COLUMN IF NOT EXISTS search_text TEXT GENERATED ALWAYS AS (
    public.glatko_unaccent_immutable(lower(
      coalesce(business_name, '') || ' ' ||
      coalesce(bio, '') || ' ' ||
      coalesce(location_city, '')
    ))
  ) STORED;

-- Partial GIN index: only verified+active pros are returned by search RPC.
CREATE INDEX IF NOT EXISTS idx_glatko_profiles_search_trgm
  ON public.glatko_professional_profiles
  USING gin (search_text extensions.gin_trgm_ops)
  WHERE is_active = TRUE AND is_verified = TRUE;

-- ----------------------------------------------------------------------------
-- 4. Synonym table (sectoral jargon, 9 locales)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.glatko_search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_slug TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('me','sr','en','tr','de','it','ru','ar','uk')),
  synonym TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (canonical_slug, locale, synonym)
);

CREATE INDEX IF NOT EXISTS idx_synonyms_locale_lower
  ON public.glatko_search_synonyms (locale, lower(synonym));

CREATE INDEX IF NOT EXISTS idx_synonyms_synonym_trgm
  ON public.glatko_search_synonyms
  USING gin (synonym extensions.gin_trgm_ops);

-- Read-only for clients; writes go through service role only.
ALTER TABLE public.glatko_search_synonyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read synonyms"
  ON public.glatko_search_synonyms
  FOR SELECT
  USING (TRUE);

COMMENT ON TABLE public.glatko_search_synonyms IS
'Sectoral jargon synonyms (9 langs) used to expand search queries before
running trgm similarity. Maintained manually; service-role writes only.';

-- ----------------------------------------------------------------------------
-- 5. Recent searches (logged-in users; anonymous use localStorage on client)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.glatko_user_recent_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  locale TEXT NOT NULL,
  result_clicked TEXT CHECK (result_clicked IN ('category','professional')),
  result_slug TEXT,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recent_searches_user_time
  ON public.glatko_user_recent_searches (user_id, searched_at DESC);

ALTER TABLE public.glatko_user_recent_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own searches"
  ON public.glatko_user_recent_searches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON public.glatko_user_recent_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches"
  ON public.glatko_user_recent_searches
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Hybrid search RPC: categories + professionals
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.glatko_search(
  q TEXT,
  loc TEXT DEFAULT 'me',
  max_categories INTEGER DEFAULT 5,
  max_professionals INTEGER DEFAULT 5
)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  slug TEXT,
  title TEXT,
  subtitle TEXT,
  hero_image_url TEXT,
  rating NUMERIC,
  review_count INTEGER,
  city TEXT,
  similarity_score REAL
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  q_norm TEXT := public.glatko_unaccent_immutable(lower(coalesce(q,'')));
BEGIN
  IF length(trim(q_norm)) < 2 THEN
    RETURN;
  END IF;

  -- Categories: match if q is similar to (a) the category's own search_text,
  -- or (b) any of the category's synonyms in the user's locale.
  -- Score = MAX of direct word_similarity vs synonym word_similarity.
  RETURN QUERY
  WITH cat_syn AS (
    SELECT
      c.id,
      c.slug,
      c.name,
      c.description,
      c.hero_image_url,
      c.is_active,
      c.search_text,
      MAX(extensions.word_similarity(q_norm, c.search_text)) AS direct_sim,
      MAX(extensions.word_similarity(
        q_norm,
        public.glatko_unaccent_immutable(lower(s.synonym))
      )) AS syn_sim
    FROM public.glatko_service_categories c
    LEFT JOIN public.glatko_search_synonyms s
      ON s.canonical_slug = c.slug
      AND s.locale = loc
    WHERE c.is_active = TRUE
      AND (
        q_norm <% c.search_text
        OR (s.synonym IS NOT NULL
            AND q_norm <% public.glatko_unaccent_immutable(lower(s.synonym)))
      )
    GROUP BY c.id, c.slug, c.name, c.description, c.hero_image_url, c.is_active, c.search_text
  )
  SELECT
    'category'::TEXT AS result_type,
    cat_syn.id AS result_id,
    cat_syn.slug,
    coalesce(cat_syn.name->>loc, cat_syn.name->>'en', cat_syn.slug)::TEXT AS title,
    coalesce(cat_syn.description->>loc, cat_syn.description->>'en', '')::TEXT AS subtitle,
    cat_syn.hero_image_url,
    NULL::NUMERIC AS rating,
    NULL::INTEGER AS review_count,
    NULL::TEXT AS city,
    GREATEST(coalesce(cat_syn.direct_sim, 0), coalesce(cat_syn.syn_sim, 0)) AS similarity_score
  FROM cat_syn
  ORDER BY similarity_score DESC
  LIMIT max_categories;

  -- Professionals (only active + verified). Pros do not have synonyms; we
  -- fuzzy-match the query directly against business_name + bio + location_city.
  RETURN QUERY
  SELECT
    'professional'::TEXT AS result_type,
    p.id AS result_id,
    p.id::TEXT AS slug,
    coalesce(p.business_name, '')::TEXT AS title,
    coalesce(p.bio, '')::TEXT AS subtitle,
    CASE
      WHEN p.portfolio_images IS NOT NULL AND array_length(p.portfolio_images,1) > 0
      THEN p.portfolio_images[1]
      ELSE NULL
    END AS hero_image_url,
    p.avg_rating::NUMERIC AS rating,
    p.total_reviews AS review_count,
    coalesce(p.location_city, '')::TEXT AS city,
    extensions.word_similarity(q_norm, p.search_text) AS similarity_score
  FROM public.glatko_professional_profiles p
  WHERE p.is_active = TRUE
    AND p.is_verified = TRUE
    AND q_norm <% p.search_text
  ORDER BY
    -- Yelp-style ranking: similarity x ln(reviews+e) x rating-confidence
    (extensions.word_similarity(q_norm, p.search_text)
      * ln(coalesce(p.total_reviews, 0)::NUMERIC + 2.0)
      * coalesce(p.avg_rating / 5.0, 0.5)
    ) DESC
  LIMIT max_professionals;
END;
$$;

REVOKE ALL ON FUNCTION public.glatko_search(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_search(TEXT, TEXT, INTEGER, INTEGER)
  TO anon, authenticated;

COMMENT ON FUNCTION public.glatko_search IS
'Premium hybrid search: trgm fuzzy match + 9-lang synonym expansion + Yelp-
style professional ranking. Returns categories + professionals interleaved
by relevance. Public callable; reads through SECURITY DEFINER over partial
GIN indexes for sub-50ms latency at small scale.';

-- ----------------------------------------------------------------------------
-- 7. Trending categories RPC (empty-state seed)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.glatko_trending_categories(
  loc TEXT DEFAULT 'me',
  max_results INTEGER DEFAULT 8
)
RETURNS TABLE (
  result_id UUID,
  slug TEXT,
  title TEXT,
  hero_image_url TEXT,
  badge_priority INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id AS result_id,
    slug,
    coalesce(name->>loc, name->>'en', slug)::TEXT AS title,
    hero_image_url,
    badge_priority
  FROM public.glatko_service_categories
  WHERE is_active = TRUE
    AND parent_id IS NULL
    AND is_p0 = TRUE
  ORDER BY badge_priority ASC NULLS LAST, sort_order ASC
  LIMIT max_results;
$$;

REVOKE ALL ON FUNCTION public.glatko_trending_categories(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.glatko_trending_categories(TEXT, INTEGER)
  TO anon, authenticated;

COMMENT ON FUNCTION public.glatko_trending_categories IS
'Top P0 root categories ordered by badge_priority for empty search-bar state.';

COMMIT;
