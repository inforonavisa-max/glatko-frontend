-- =============================================================================
-- Founding Majstor (Provider) Onboarding — Parameterized Template
-- =============================================================================
--
-- Purpose:
--   Manually onboard a "founding" service provider when the public Pro Wizard
--   gets stuck or before public launch. Each block is wrapped in a single
--   BEGIN / COMMIT so the whole insert is atomic.
--
-- How to use (Helena workflow):
--   1. Open Glatko Supabase SQL editor:
--      https://supabase.com/dashboard/project/cjqappdfyxgytdyeytwv/sql/new
--   2. Copy this entire file into the editor.
--   3. Find/replace every {{placeholder}} with the value collected from the
--      majstor (full list below).
--   4. Click "Run". If a guard fires, the transaction aborts cleanly — no
--      partial state. Read the RAISE EXCEPTION message and re-audit.
--   5. After success, run the post-checks at the bottom (B1–B4) to verify.
--
-- Project ref:
--   cjqappdfyxgytdyeytwv  (glatko-prod)
--   Do NOT run this against Fijaka or RoNa.
--
-- Placeholders (every {{...}} must be replaced):
--
--   {{user_id}}                UUID — auth.users.id (the majstor must already
--                              have signed up; you find this in the Auth tab).
--   {{expected_email}}         Email — must match profiles.email for the UID.
--                              Guard 0a aborts if mismatched.
--   {{founding_number}}        Integer — next free founding_provider_number.
--                              Find it with:
--                                SELECT COALESCE(MAX(founding_provider_number), 0) + 1
--                                FROM glatko_professional_profiles;
--                              Guard 0c aborts if already taken.
--   {{business_name}}          Text — trading/business name. Use the form the
--                              majstor wants displayed; defaults to full name.
--   {{slug}}                   Text — lowercase + ASCII-folded + kebab-case
--                              of business_name.
--                              Examples:
--                                "Miloš Golubović"        -> milos-golubovic
--                                "Tobefit pilates studio" -> tobefit-pilates-studio
--                                "Ela Hilal Pastacı"      -> ela-hilal-pastaci
--                              Rule: NFD normalize, drop combining marks,
--                              replace non-[a-z0-9] with "-", collapse runs,
--                              trim leading/trailing "-".
--   {{phone}}                  Text — international format with country code.
--                              Convention: '+382 XX XXX XXX' for Crna Gora.
--   {{bio}}                    Text — multiline OK. Use single quotes; if the
--                              bio itself contains an apostrophe, double it
--                              (' -> ''). Diacritics (ć/š/đ) are fine.
--                              Surround with single quotes — the placeholder
--                              already includes them in the template below.
--   {{location_city}}          Text — lowercase + ASCII-folded city slug.
--                              Existing values: 'podgorica', 'budva', 'kotor',
--                              'bar', 'herceg-novi'. Use the same form as the
--                              homepage city filter (lowercase, hyphenated).
--   {{service_radius_km}}      Integer — how far the majstor is willing to
--                              travel from base. Defaults: 25 (city-only) up
--                              to 200 (whole country).
--   {{languages}}              text[] — service-provider's working languages.
--                              Common values:
--                                ARRAY['me','sr']::text[]      (Crna Gora local)
--                                ARRAY['me','sr','en']::text[] (+ tourists)
--                                ARRAY['tr','en']::text[]      (TR diaspora)
--   {{years_experience}}       Integer or NULL — years working in this trade.
--                              0 means "started this year". NULL = unknown.
--   {{primary_category_id}}    UUID — the ONE service category the majstor
--                              should appear under as primary. Look up via:
--                                SELECT id, slug, name->>'me' AS name_me
--                                FROM glatko_service_categories
--                                WHERE slug = '<slug-from-helena>';
--   {{secondary_category_ids}} Comma-separated list of UUIDs — other
--                              categories the majstor handles. Leave the
--                              VALUES list empty if there are no secondaries
--                              (just remove the comma-separated lines).
--
-- Constants in this template (do NOT replace; matches existing 9 founding pros):
--   verification_status = 'approved'
--   verification_tier   = 'basic'
--   is_verified         = true
--   verified_at         = now()
--   is_active           = true
--   insurance_status    = 'none'
--   portfolio_images    = ARRAY[]::text[]   -- updated separately after photo upload
--   is_founding_provider = true
--   founding_provider_at = now()
--
-- Photo upload (separate, after this SQL succeeds):
--   1. Storage > avatars bucket > Create folder named {{user_id}} > upload
--      avatar.jpg (max 5 MB, image/jpeg|png|webp).
--   2. Storage > pro-portfolio bucket > Create folder named {{user_id}} >
--      upload portfolio-1.jpg, portfolio-2.jpg, ... (max 10 MB each).
--   3. Run the photo-update block at the very bottom of this file.
--
-- =============================================================================

BEGIN;

-- 0a. Email-match guard
DO $$
DECLARE
  found_email text;
BEGIN
  SELECT email INTO found_email FROM profiles
  WHERE id = '{{user_id}}';
  IF found_email IS NULL THEN
    RAISE EXCEPTION 'Profile row not found for UID — aborting';
  END IF;
  IF found_email <> '{{expected_email}}' THEN
    RAISE EXCEPTION 'Email mismatch: expected {{expected_email}}, got %', found_email;
  END IF;
END $$;

-- 0b. No-duplicate-pro guard
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM glatko_professional_profiles
    WHERE id = '{{user_id}}'
  ) THEN
    RAISE EXCEPTION 'Pro profile already exists for UID — aborting to prevent duplicate';
  END IF;
END $$;

-- 0c. Founding-number-free guard
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM glatko_professional_profiles
    WHERE founding_provider_number = {{founding_number}}
  ) THEN
    RAISE EXCEPTION 'founding_provider_number={{founding_number}} already taken — re-audit and pick next';
  END IF;
END $$;

-- 1. Patch the existing profiles row with phone + city (if missing)
UPDATE profiles
SET phone = '{{phone}}',
    city  = '{{location_city_display}}'  -- Title-cased display form, e.g. "Herceg Novi"
WHERE id = '{{user_id}}';

-- 2. Create the professional profile
INSERT INTO glatko_professional_profiles (
  id, business_name, slug, phone, bio,
  hourly_rate_min, hourly_rate_max, years_experience,
  location, location_city, service_radius_km, languages,
  is_verified, verified_at, is_active, verification_status,
  verification_tier, insurance_status, portfolio_images,
  is_founding_provider, founding_provider_at, founding_provider_number
) VALUES (
  '{{user_id}}',
  '{{business_name}}',
  '{{slug}}',
  '{{phone}}',
  '{{bio}}',
  NULL, NULL, {{years_experience}},
  NULL, '{{location_city}}', {{service_radius_km}}, {{languages}},
  true, now(), true, 'approved',
  'basic', 'none', ARRAY[]::text[],
  true, now(), {{founding_number}}
);

-- 3. Link service categories
--    First row is the primary; add as many secondary rows as needed.
INSERT INTO glatko_pro_services (professional_id, category_id, is_primary) VALUES
  ('{{user_id}}', '{{primary_category_id}}', true)
  -- , ('{{user_id}}', '{{secondary_category_id_1}}', false)
  -- , ('{{user_id}}', '{{secondary_category_id_2}}', false)
  -- , ('{{user_id}}', '{{secondary_category_id_3}}', false)
;

COMMIT;

-- =============================================================================
-- B. Post-run verification — copy these into a new SQL editor tab and run
-- =============================================================================

-- B1. Pro profile created with the right values
-- SELECT id, business_name, slug, phone, location_city,
--        service_radius_km, languages, is_active, is_verified,
--        verification_status, verification_tier, is_founding_provider,
--        founding_provider_number, verified_at
-- FROM glatko_professional_profiles
-- WHERE id = '{{user_id}}';

-- B2. Services linked, exactly one primary
-- SELECT sc.slug, sc.name->>'me' AS name_me, ps.is_primary
-- FROM glatko_pro_services ps
-- JOIN glatko_service_categories sc ON sc.id = ps.category_id
-- WHERE ps.professional_id = '{{user_id}}'
-- ORDER BY ps.is_primary DESC, sc.slug;

-- B3. profiles patch applied (phone + city)
-- SELECT id, full_name, phone, city, role, is_active
-- FROM profiles
-- WHERE id = '{{user_id}}';

-- B4. Founding sequence integrity (1..N, no gaps)
-- SELECT founding_provider_number, business_name, founding_provider_at
-- FROM glatko_professional_profiles
-- WHERE is_founding_provider = true
-- ORDER BY founding_provider_number;

-- =============================================================================
-- C. Photo URL update — run AFTER you upload to Storage
-- =============================================================================
--
-- Path conventions (must match):
--   avatars/{{user_id}}/avatar.jpg
--   pro-portfolio/{{user_id}}/portfolio-1.jpg
--   pro-portfolio/{{user_id}}/portfolio-2.jpg
--   pro-portfolio/{{user_id}}/portfolio-3.jpg
--
-- Public URL pattern:
--   https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/<bucket>/<path>
--
-- BEGIN;
-- UPDATE profiles
-- SET avatar_url = 'https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/avatars/{{user_id}}/avatar.jpg'
-- WHERE id = '{{user_id}}';
--
-- UPDATE glatko_professional_profiles
-- SET portfolio_images = ARRAY[
--   'https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/pro-portfolio/{{user_id}}/portfolio-1.jpg',
--   'https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/pro-portfolio/{{user_id}}/portfolio-2.jpg',
--   'https://cjqappdfyxgytdyeytwv.supabase.co/storage/v1/object/public/pro-portfolio/{{user_id}}/portfolio-3.jpg'
-- ]::text[]
-- WHERE id = '{{user_id}}';
-- COMMIT;
--
-- (After commit, hit each URL with `curl -I` to confirm 200.)
--
-- =============================================================================
-- Notes for future maintainers
-- =============================================================================
--
-- - is_active = true at insert is the current convention (matches founding pros
--   #1-#10). If a "soft-launch / pending activation" model is later introduced,
--   change the literal here to false and add a separate post-launch UPDATE.
--
-- - verified_at is set to now() because every existing founding pro has a
--   non-NULL verified_at. Re-audit before reuse:
--     SELECT COUNT(*) FILTER (WHERE verified_at IS NOT NULL) AS filled,
--            COUNT(*) FILTER (WHERE verified_at IS NULL)     AS null_count
--     FROM glatko_professional_profiles WHERE is_founding_provider = true;
--   If the founding cohort starts mixing NULL and non-NULL, the convention has
--   shifted — pause and ask before continuing.
--
-- - profiles.role stays as 'user' even after the pro insert. Existing 9 founding
--   pros confirm this — there is no role promotion required.
--
-- - location (geography(Point,4326)) is left NULL. If you need geocoded location
--   later, set location = ST_SetSRID(ST_MakePoint(<lng>,<lat>), 4326).
