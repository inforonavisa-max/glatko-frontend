-- ============================================================================
-- 011_glatko_hero_webp_repoint.sql
-- G-CAT-2A-OPTIMIZE: hero images PNG -> WebP for ~92% size reduction
--
-- Audit trail only — actually applied via Python REST API (the same per-row
-- PATCH pattern the project uses everywhere else for clipboard-safety).
-- 19 MB total -> 1.5 MB total across the 10 P0 root hero images.
-- PNG sources kept in Storage as a rollback safety net.
-- ============================================================================

UPDATE glatko_service_categories
SET hero_image_url = REPLACE(hero_image_url, '-hero.png', '-hero.webp')
WHERE is_p0 = TRUE
  AND parent_id IS NULL
  AND hero_image_url LIKE '%-hero.png';

-- Verification
SELECT slug, hero_image_url
FROM glatko_service_categories
WHERE is_p0 = TRUE AND parent_id IS NULL
ORDER BY badge_priority;

-- Rollback (if WebP quality is rejected): just swap the extension back.
-- The PNG objects are still in the bucket.
--
--   UPDATE glatko_service_categories
--   SET hero_image_url = REPLACE(hero_image_url, '-hero.webp', '-hero.png')
--   WHERE is_p0 = TRUE AND parent_id IS NULL
--     AND hero_image_url LIKE '%-hero.webp';
