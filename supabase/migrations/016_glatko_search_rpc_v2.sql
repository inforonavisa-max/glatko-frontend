-- ============================================================================
-- 016_glatko_search_rpc_v2.sql
-- G-CAT-3: glatko_search RPC v2 — UNION ALL pattern with debug match_type
--
-- Replaces the v1 LEFT JOIN + GROUP BY shape from 014 with two clear CTEs:
--   1) direct_categories  — query fuzzy-matches the category's own search_text
--   2) synonym_categories — query fuzzy-matches a synonym row in the locale
-- UNION ALL'd and de-duplicated by category id (highest score wins).
--
-- Adds `match_type` ('direct' | 'synonym') for debugging which path produced
-- each result. Uses Postgres default `pg_trgm.word_similarity_threshold` (0.6)
-- since Supabase managed roles can't override GUCs at function level; queries
-- in scope are exact-match against synonyms or full search_text and clear 0.6
-- comfortably. If recall ever needs widening, use the explicit `>=` form
-- in the WHERE instead of `<%` and pass an explicit threshold.
--
-- Tables, indexes, and synonym seed from 014/015 are unchanged.
-- ============================================================================

BEGIN;

-- DROP first because we change the RETURNS TABLE shape (add match_type).
-- CREATE OR REPLACE cannot alter return signature.
DROP FUNCTION IF EXISTS public.glatko_search(TEXT, TEXT, INTEGER, INTEGER);

CREATE FUNCTION public.glatko_search(
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
  similarity_score REAL,
  match_type TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  q_norm TEXT := public.glatko_unaccent_immutable(lower(coalesce(q, '')));
BEGIN
  IF length(trim(q_norm)) < 2 THEN
    RETURN;
  END IF;

  -- --------------------------------------------------------------------------
  -- Categories: direct fuzzy OR synonym fuzzy, deduped by category id.
  -- --------------------------------------------------------------------------
  RETURN QUERY
  WITH
  direct_categories AS (
    SELECT
      'category'::TEXT AS result_type,
      c.id AS result_id,
      c.slug,
      coalesce(c.name->>loc, c.name->>'en', c.slug)::TEXT AS title,
      coalesce(c.description->>loc, c.description->>'en', '')::TEXT AS subtitle,
      c.hero_image_url,
      NULL::NUMERIC AS rating,
      NULL::INTEGER AS review_count,
      NULL::TEXT AS city,
      extensions.word_similarity(q_norm, c.search_text)::REAL AS similarity_score,
      'direct'::TEXT AS match_type
    FROM public.glatko_service_categories c
    WHERE c.is_active = TRUE
      AND q_norm <% c.search_text
  ),
  synonym_categories AS (
    SELECT DISTINCT ON (c.id)
      'category'::TEXT AS result_type,
      c.id AS result_id,
      c.slug,
      coalesce(c.name->>loc, c.name->>'en', c.slug)::TEXT AS title,
      coalesce(c.description->>loc, c.description->>'en', '')::TEXT AS subtitle,
      c.hero_image_url,
      NULL::NUMERIC AS rating,
      NULL::INTEGER AS review_count,
      NULL::TEXT AS city,
      (extensions.word_similarity(q_norm, public.glatko_unaccent_immutable(lower(s.synonym)))
        * (1.0 + s.weight * 0.1))::REAL AS similarity_score,
      'synonym'::TEXT AS match_type
    FROM public.glatko_search_synonyms s
    JOIN public.glatko_service_categories c ON c.slug = s.canonical_slug
    WHERE s.locale = loc
      AND c.is_active = TRUE
      AND q_norm <% public.glatko_unaccent_immutable(lower(s.synonym))
    ORDER BY c.id, similarity_score DESC
  ),
  combined_categories AS (
    SELECT * FROM direct_categories
    UNION ALL
    SELECT * FROM synonym_categories
  ),
  ranked_categories AS (
    SELECT DISTINCT ON (result_id) *
    FROM combined_categories
    ORDER BY result_id, similarity_score DESC
  )
  SELECT
    r.result_type,
    r.result_id,
    r.slug,
    r.title,
    r.subtitle,
    r.hero_image_url,
    r.rating,
    r.review_count,
    r.city,
    r.similarity_score,
    r.match_type
  FROM ranked_categories r
  ORDER BY r.similarity_score DESC
  LIMIT max_categories;

  -- --------------------------------------------------------------------------
  -- Professionals: only active + verified, fuzzy on business_name+bio+city.
  -- (No synonyms for pros — synonym table is category-scoped.)
  -- --------------------------------------------------------------------------
  RETURN QUERY
  SELECT
    'professional'::TEXT AS result_type,
    p.id AS result_id,
    p.id::TEXT AS slug,
    coalesce(p.business_name, '')::TEXT AS title,
    coalesce(p.bio, '')::TEXT AS subtitle,
    CASE
      WHEN p.portfolio_images IS NOT NULL AND array_length(p.portfolio_images, 1) > 0
      THEN p.portfolio_images[1]
      ELSE NULL
    END AS hero_image_url,
    p.avg_rating::NUMERIC AS rating,
    p.total_reviews AS review_count,
    coalesce(p.location_city, '')::TEXT AS city,
    extensions.word_similarity(q_norm, p.search_text)::REAL AS similarity_score,
    'direct'::TEXT AS match_type
  FROM public.glatko_professional_profiles p
  WHERE p.is_active = TRUE
    AND p.is_verified = TRUE
    AND q_norm <% p.search_text
  ORDER BY
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
'Premium hybrid search v2: trgm fuzzy + 9-lang synonym JOIN (no concat) +
Yelp-style pro ranking. UNION ALL of direct + synonym CTEs, deduped by
result_id. match_type column distinguishes direct vs synonym match for debug.';

COMMIT;
