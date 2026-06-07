-- 058_glatko_search_slug_provider_fix
-- P0 fix (G-PROVIDER-ROUTE-CLEANUP, 2026-06-07): glatko_search returned
-- p.id (UUID) in the `slug` column for professional rows, so the cmd-k
-- SearchModal routed to /pros/<UUID> → notFound() (404).
-- ONLY the professionals slug projection changes:
--   p.id::TEXT AS slug  →  coalesce(p.slug, p.id::TEXT) AS slug
-- Everything else is identical to the prior definition. CREATE OR REPLACE
-- (same signature) → idempotent, atomic, instantly reversible.
-- Applied to prod (cjqappdfyxgytdyeytwv) via apply_migration 2026-06-07;
-- this file keeps the repo migration history in sync.

CREATE OR REPLACE FUNCTION public.glatko_search(q text, loc text DEFAULT 'me'::text, max_categories integer DEFAULT 5, max_professionals integer DEFAULT 5)
 RETURNS TABLE(result_type text, result_id uuid, slug text, title text, subtitle text, hero_image_url text, rating numeric, review_count integer, city text, similarity_score real, match_type text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  q_norm TEXT := public.glatko_unaccent_immutable(lower(coalesce(q, '')));
BEGIN
  IF length(trim(q_norm)) < 2 THEN
    RETURN;
  END IF;

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
    r.result_type, r.result_id, r.slug, r.title, r.subtitle, r.hero_image_url,
    r.rating, r.review_count, r.city, r.similarity_score, r.match_type
  FROM ranked_categories r
  ORDER BY r.similarity_score DESC
  LIMIT max_categories;

  RETURN QUERY
  SELECT
    'professional'::TEXT AS result_type,
    p.id AS result_id,
    coalesce(p.slug, p.id::TEXT) AS slug,   -- FIX: real slug (was p.id::TEXT)
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
$function$;
