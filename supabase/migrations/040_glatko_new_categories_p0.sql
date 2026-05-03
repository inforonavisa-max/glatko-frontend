-- ═══════════════════════════════════════════════════════════════════════════
-- Hot-fix 28: 4 new categories is_p0=true + badge_priority
-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 038 inserted the 4 new categories (garden-pool, events-wedding,
-- photo-video, health-wellness) with is_active=true + sort_order=11..14 but
-- did NOT set is_p0=true (column default → false). The /services page filters
-- WHERE is_p0=true so the 4 new categories never rendered.
--
-- This migration flips is_p0=true for the 4 new categories and assigns
-- badge_priority 11-14 (matching sort_order, after the existing 10 evergreen).
--
-- Idempotent: WHERE clause filters specific slugs.
--
-- Note: hero_image_url is set separately by scripts/generate-new-category-heroes.ts
-- (Replicate FLUX 1.1 Pro → /public/categories/{slug}.webp → DB UPDATE).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.glatko_service_categories
   SET is_p0 = true,
       badge_priority = 11
 WHERE slug = 'garden-pool';

UPDATE public.glatko_service_categories
   SET is_p0 = true,
       badge_priority = 12
 WHERE slug = 'events-wedding';

UPDATE public.glatko_service_categories
   SET is_p0 = true,
       badge_priority = 13
 WHERE slug = 'photo-video';

UPDATE public.glatko_service_categories
   SET is_p0 = true,
       badge_priority = 14
 WHERE slug = 'health-wellness';

COMMIT;

-- Verification:
-- SELECT slug, is_p0, hero_image_url, badge_priority, sort_order
--   FROM glatko_service_categories
--   WHERE slug IN ('garden-pool', 'events-wedding', 'photo-video', 'health-wellness')
--   ORDER BY badge_priority;
