-- ═══════════════════════════════════════════════════════════════════════════
-- G-SEO-FOUNDATION migration 041: provider slug field for SEO-friendly URLs
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds a unique slug column to glatko_professional_profiles so we can serve
-- /[locale]/pros/[slug] (e.g. /me/pros/ottowin) instead of UUID URLs. The slug
-- is auto-generated from business_name on insert via a trigger; admins can
-- override manually if a collision arises.
--
-- Slug generation rules:
--   1. lowercase
--   2. transliterate Turkish/Slavic diacritics (ı→i, ç→c, ş→s, ğ→g, ü→u, ö→o,
--      ć→c, š→s, ž→z, đ→dj, ı→i)
--   3. strip non-alphanumeric (keep hyphens)
--   4. collapse whitespace → single hyphen
--   5. trim leading/trailing hyphens
--   6. on collision, append `-{first 8 chars of UUID}`
--
-- Examples:
--   "OttoWin"               → "ottowin"
--   "Ela Hilal Pastacı"     → "ela-hilal-pastaci"
--   "Müzik & Eğitim Atölye" → "muzik-egitim-atolye"
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Add slug column (nullable initially, backfill, then NOT NULL).
ALTER TABLE public.glatko_professional_profiles
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Helper function: slugify business_name with diacritic transliteration.
CREATE OR REPLACE FUNCTION public.glatko_slugify(input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  out TEXT;
BEGIN
  IF input IS NULL OR length(trim(input)) = 0 THEN
    RETURN NULL;
  END IF;
  out := lower(input);
  -- Turkish
  out := translate(out, 'ıİçÇşŞğĞüÜöÖ', 'iicCsSgGuUoO');
  -- BCMS / Slavic Latin
  out := translate(out, 'ćĆčČšŠžŽ', 'cCcCsSzZ');
  -- Đ/đ require multi-char replace
  out := replace(out, 'đ', 'dj');
  out := replace(out, 'Đ', 'dj');
  -- German umlauts (extra safety; typed as 2 chars in some inputs)
  out := replace(out, 'ä', 'a');
  out := replace(out, 'ß', 'ss');
  -- Strip everything except [a-z0-9-\s]
  out := regexp_replace(out, '[^a-z0-9\-\s]', '', 'g');
  -- Collapse whitespace runs to single hyphen
  out := regexp_replace(out, '\s+', '-', 'g');
  -- Collapse multiple hyphens
  out := regexp_replace(out, '-+', '-', 'g');
  -- Trim leading/trailing hyphens
  out := trim(both '-' from out);
  RETURN nullif(out, '');
END;
$$;

-- 3. Backfill existing rows. Append `-{id-prefix}` on collision.
UPDATE public.glatko_professional_profiles
SET slug = COALESCE(
  public.glatko_slugify(business_name),
  'pro-' || substring(id::text from 1 for 8)
)
WHERE slug IS NULL;

-- Resolve any collisions in backfill by appending id prefix to duplicates.
WITH dups AS (
  SELECT id, slug,
         ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at ASC) AS rn
  FROM public.glatko_professional_profiles
  WHERE slug IS NOT NULL
)
UPDATE public.glatko_professional_profiles AS p
SET slug = p.slug || '-' || substring(p.id::text from 1 for 8)
FROM dups
WHERE dups.id = p.id AND dups.rn > 1;

-- 4. Now enforce NOT NULL + UNIQUE.
ALTER TABLE public.glatko_professional_profiles
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS glatko_professional_profiles_slug_key
  ON public.glatko_professional_profiles (slug);

-- 5. BEFORE INSERT trigger: auto-fill slug if not provided, and de-duplicate.
CREATE OR REPLACE FUNCTION public.glatko_pro_slug_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  attempt INT := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND length(trim(NEW.slug)) > 0 THEN
    -- Caller supplied a slug; trust it (UNIQUE index will reject collisions).
    RETURN NEW;
  END IF;
  base := COALESCE(public.glatko_slugify(NEW.business_name), 'pro-' || substring(NEW.id::text from 1 for 8));
  candidate := base;
  -- On collision, append a numeric suffix.
  WHILE EXISTS (SELECT 1 FROM public.glatko_professional_profiles WHERE slug = candidate) LOOP
    attempt := attempt + 1;
    candidate := base || '-' || attempt::text;
    IF attempt > 50 THEN
      candidate := base || '-' || substring(NEW.id::text from 1 for 8);
      EXIT;
    END IF;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS glatko_pro_slug_before_insert_trigger
  ON public.glatko_professional_profiles;
CREATE TRIGGER glatko_pro_slug_before_insert_trigger
  BEFORE INSERT ON public.glatko_professional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.glatko_pro_slug_before_insert();

COMMIT;

-- Verification:
-- SELECT id, business_name, slug FROM glatko_professional_profiles ORDER BY created_at;
-- Expected: ottowin, ela-hilal-pastaci (or similar transliterated values).
