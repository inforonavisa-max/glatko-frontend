-- ============================================================================
-- 015_glatko_search_synonyms_seed.sql
-- G-CAT-3: Sectoral synonym seed (9 langs) - QUALITY GATE BATCH 1
--
-- This is the first 3 categories (boat-services, home-cleaning, beauty-wellness)
-- across all 9 locales for Rohat's quality review. Once approved, batch 2
-- (renovation, catering, tutoring, childcare, moving, automotive, airbnb)
-- will land in 016_glatko_search_synonyms_seed_part2.sql.
--
-- Conventions:
--   - weight 2: alternative noun (yacht for boat-services)
--   - weight 3: domain term / jargon (antifouling, gelcoat)
--   - lowercase the synonym; query side also normalizes to lowercase
--   - NO English fallback per locale: every locale row is genuinely localized.
--   - Cross-borrowed loanwords (e.g. 'antifouling' in tr, 'osmoz' in tr) are
--     kept where the loanword is the actual term used in the trade.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. boat-services — Tekne Hizmetleri / Usluge za plovila / Boat Services
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- Karadağca (me) - Crnogorski
  ('boat-services', 'me', 'plovilo', 2),
  ('boat-services', 'me', 'jahta', 2),
  ('boat-services', 'me', 'brod', 2),
  ('boat-services', 'me', 'čamac', 2),
  ('boat-services', 'me', 'gliser', 2),
  ('boat-services', 'me', 'jedrenjak', 2),
  ('boat-services', 'me', 'antifouling', 3),
  ('boat-services', 'me', 'osmoza', 3),
  ('boat-services', 'me', 'gelcoat', 3),
  ('boat-services', 'me', 'haul-out', 3),
  ('boat-services', 'me', 'marina', 2),
  ('boat-services', 'me', 'sidro', 2),

  -- Sırpça (sr) - Srpski (Latinica)
  ('boat-services', 'sr', 'plovilo', 2),
  ('boat-services', 'sr', 'jahta', 2),
  ('boat-services', 'sr', 'brod', 2),
  ('boat-services', 'sr', 'čamac', 2),
  ('boat-services', 'sr', 'gliser', 2),
  ('boat-services', 'sr', 'jedrenjak', 2),
  ('boat-services', 'sr', 'antifouling', 3),
  ('boat-services', 'sr', 'osmoza', 3),
  ('boat-services', 'sr', 'gelcoat', 3),
  ('boat-services', 'sr', 'marina', 2),
  ('boat-services', 'sr', 'sidro', 2),

  -- İngilizce (en)
  ('boat-services', 'en', 'yacht', 2),
  ('boat-services', 'en', 'boat', 2),
  ('boat-services', 'en', 'vessel', 2),
  ('boat-services', 'en', 'sailboat', 2),
  ('boat-services', 'en', 'motorboat', 2),
  ('boat-services', 'en', 'speedboat', 2),
  ('boat-services', 'en', 'antifouling', 3),
  ('boat-services', 'en', 'osmosis', 3),
  ('boat-services', 'en', 'gelcoat', 3),
  ('boat-services', 'en', 'hull cleaning', 3),
  ('boat-services', 'en', 'haul out', 3),
  ('boat-services', 'en', 'marina', 2),

  -- Türkçe (tr)
  ('boat-services', 'tr', 'tekne', 2),
  ('boat-services', 'tr', 'yat', 2),
  ('boat-services', 'tr', 'gemi', 2),
  ('boat-services', 'tr', 'sürat teknesi', 2),
  ('boat-services', 'tr', 'yelkenli', 2),
  ('boat-services', 'tr', 'antifouling', 3),
  ('boat-services', 'tr', 'tekne dibi', 3),
  ('boat-services', 'tr', 'osmoz', 3),
  ('boat-services', 'tr', 'jelkot', 3),
  ('boat-services', 'tr', 'marina', 2),
  ('boat-services', 'tr', 'çekek', 3),

  -- Almanca (de)
  ('boat-services', 'de', 'yacht', 2),
  ('boat-services', 'de', 'boot', 2),
  ('boat-services', 'de', 'schiff', 2),
  ('boat-services', 'de', 'segelboot', 2),
  ('boat-services', 'de', 'motorboot', 2),
  ('boat-services', 'de', 'antifouling', 3),
  ('boat-services', 'de', 'osmose', 3),
  ('boat-services', 'de', 'gelcoat', 3),
  ('boat-services', 'de', 'rumpfreinigung', 3),
  ('boat-services', 'de', 'marina', 2),
  ('boat-services', 'de', 'krantermin', 3),

  -- İtalyanca (it)
  ('boat-services', 'it', 'yacht', 2),
  ('boat-services', 'it', 'barca', 2),
  ('boat-services', 'it', 'imbarcazione', 2),
  ('boat-services', 'it', 'vela', 2),
  ('boat-services', 'it', 'motoscafo', 2),
  ('boat-services', 'it', 'antivegetativa', 3),
  ('boat-services', 'it', 'osmosi', 3),
  ('boat-services', 'it', 'gelcoat', 3),
  ('boat-services', 'it', 'pulizia carena', 3),
  ('boat-services', 'it', 'porto', 2),
  ('boat-services', 'it', 'alaggio', 3),

  -- Rusça (ru)
  ('boat-services', 'ru', 'яхта', 2),
  ('boat-services', 'ru', 'катер', 2),
  ('boat-services', 'ru', 'лодка', 2),
  ('boat-services', 'ru', 'судно', 2),
  ('boat-services', 'ru', 'парусник', 2),
  ('boat-services', 'ru', 'моторная лодка', 2),
  ('boat-services', 'ru', 'антифоулинг', 3),
  ('boat-services', 'ru', 'осмос', 3),
  ('boat-services', 'ru', 'гелькоут', 3),
  ('boat-services', 'ru', 'марина', 2),
  ('boat-services', 'ru', 'подъем из воды', 3),

  -- Arapça (ar)
  ('boat-services', 'ar', 'يخت', 2),
  ('boat-services', 'ar', 'قارب', 2),
  ('boat-services', 'ar', 'سفينة', 2),
  ('boat-services', 'ar', 'مركب', 2),
  ('boat-services', 'ar', 'قارب شراعي', 2),
  ('boat-services', 'ar', 'قارب بمحرك', 2),
  ('boat-services', 'ar', 'مرسى', 2),
  ('boat-services', 'ar', 'تنظيف هيكل القارب', 3),
  ('boat-services', 'ar', 'طلاء مضاد للحشف', 3),

  -- Ukraynaca (uk)
  ('boat-services', 'uk', 'яхта', 2),
  ('boat-services', 'uk', 'човен', 2),
  ('boat-services', 'uk', 'судно', 2),
  ('boat-services', 'uk', 'вітрильник', 2),
  ('boat-services', 'uk', 'моторний човен', 2),
  ('boat-services', 'uk', 'антифаулінг', 3),
  ('boat-services', 'uk', 'осмос', 3),
  ('boat-services', 'uk', 'гелькоут', 3),
  ('boat-services', 'uk', 'марина', 2),
  ('boat-services', 'uk', 'підйом з води', 3);


-- ----------------------------------------------------------------------------
-- 2. home-cleaning — Ev Temizlik / Čišćenje kuća / Home Cleaning
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- Karadağca (me)
  ('home-cleaning', 'me', 'čišćenje', 2),
  ('home-cleaning', 'me', 'spremanje', 2),
  ('home-cleaning', 'me', 'pranje', 2),
  ('home-cleaning', 'me', 'pranje tepiha', 3),
  ('home-cleaning', 'me', 'detaljno čišćenje', 3),
  ('home-cleaning', 'me', 'generalno čišćenje', 3),
  ('home-cleaning', 'me', 'čistačica', 2),
  ('home-cleaning', 'me', 'sredstvo za čišćenje', 3),
  ('home-cleaning', 'me', 'čišćenje vile', 3),

  -- Sırpça (sr)
  ('home-cleaning', 'sr', 'čišćenje', 2),
  ('home-cleaning', 'sr', 'spremanje', 2),
  ('home-cleaning', 'sr', 'pranje', 2),
  ('home-cleaning', 'sr', 'pranje tepiha', 3),
  ('home-cleaning', 'sr', 'detaljno čišćenje', 3),
  ('home-cleaning', 'sr', 'generalno čišćenje', 3),
  ('home-cleaning', 'sr', 'čistačica', 2),
  ('home-cleaning', 'sr', 'čišćenje vile', 3),

  -- İngilizce (en)
  ('home-cleaning', 'en', 'cleaning', 2),
  ('home-cleaning', 'en', 'house cleaning', 2),
  ('home-cleaning', 'en', 'apartment cleaning', 2),
  ('home-cleaning', 'en', 'maid service', 3),
  ('home-cleaning', 'en', 'deep clean', 3),
  ('home-cleaning', 'en', 'spring cleaning', 3),
  ('home-cleaning', 'en', 'carpet cleaning', 3),
  ('home-cleaning', 'en', 'window cleaning', 3),
  ('home-cleaning', 'en', 'cleaner', 2),
  ('home-cleaning', 'en', 'housekeeping', 2),

  -- Türkçe (tr)
  ('home-cleaning', 'tr', 'temizlik', 2),
  ('home-cleaning', 'tr', 'temizlikçi', 2),
  ('home-cleaning', 'tr', 'ev temizliği', 2),
  ('home-cleaning', 'tr', 'daire temizliği', 2),
  ('home-cleaning', 'tr', 'halı yıkama', 3),
  ('home-cleaning', 'tr', 'detaylı temizlik', 3),
  ('home-cleaning', 'tr', 'genel temizlik', 3),
  ('home-cleaning', 'tr', 'cam silme', 3),
  ('home-cleaning', 'tr', 'inşaat sonrası temizlik', 3),
  ('home-cleaning', 'tr', 'gündelik temizlik', 3),

  -- Almanca (de)
  ('home-cleaning', 'de', 'reinigung', 2),
  ('home-cleaning', 'de', 'putzen', 2),
  ('home-cleaning', 'de', 'haushaltsreinigung', 2),
  ('home-cleaning', 'de', 'wohnungsreinigung', 2),
  ('home-cleaning', 'de', 'teppichreinigung', 3),
  ('home-cleaning', 'de', 'fensterputzen', 3),
  ('home-cleaning', 'de', 'grundreinigung', 3),
  ('home-cleaning', 'de', 'putzfrau', 2),
  ('home-cleaning', 'de', 'putzhilfe', 2),

  -- İtalyanca (it)
  ('home-cleaning', 'it', 'pulizia', 2),
  ('home-cleaning', 'it', 'pulizie domestiche', 2),
  ('home-cleaning', 'it', 'pulizia casa', 2),
  ('home-cleaning', 'it', 'pulizia appartamento', 2),
  ('home-cleaning', 'it', 'pulizia profonda', 3),
  ('home-cleaning', 'it', 'pulitura tappeti', 3),
  ('home-cleaning', 'it', 'lavavetri', 3),
  ('home-cleaning', 'it', 'colf', 2),
  ('home-cleaning', 'it', 'donna delle pulizie', 2),

  -- Rusça (ru)
  ('home-cleaning', 'ru', 'уборка', 2),
  ('home-cleaning', 'ru', 'клининг', 3),
  ('home-cleaning', 'ru', 'уборка квартиры', 2),
  ('home-cleaning', 'ru', 'уборка дома', 2),
  ('home-cleaning', 'ru', 'генеральная уборка', 3),
  ('home-cleaning', 'ru', 'химчистка ковров', 3),
  ('home-cleaning', 'ru', 'мытье окон', 3),
  ('home-cleaning', 'ru', 'уборщица', 2),
  ('home-cleaning', 'ru', 'клинер', 2),

  -- Arapça (ar)
  ('home-cleaning', 'ar', 'تنظيف', 2),
  ('home-cleaning', 'ar', 'تنظيف المنزل', 2),
  ('home-cleaning', 'ar', 'تنظيف الشقة', 2),
  ('home-cleaning', 'ar', 'تنظيف عميق', 3),
  ('home-cleaning', 'ar', 'تنظيف السجاد', 3),
  ('home-cleaning', 'ar', 'تنظيف النوافذ', 3),
  ('home-cleaning', 'ar', 'عاملة نظافة', 2),
  ('home-cleaning', 'ar', 'خادمة', 2),

  -- Ukraynaca (uk)
  ('home-cleaning', 'uk', 'прибирання', 2),
  ('home-cleaning', 'uk', 'клінінг', 3),
  ('home-cleaning', 'uk', 'прибирання квартири', 2),
  ('home-cleaning', 'uk', 'прибирання будинку', 2),
  ('home-cleaning', 'uk', 'генеральне прибирання', 3),
  ('home-cleaning', 'uk', 'хімчистка килимів', 3),
  ('home-cleaning', 'uk', 'миття вікон', 3),
  ('home-cleaning', 'uk', 'прибиральниця', 2),
  ('home-cleaning', 'uk', 'клінер', 2);


-- ----------------------------------------------------------------------------
-- 3. beauty-wellness — Güzellik & Bakım / Lepota i nega / Beauty & Wellness
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- Karadağca (me)
  ('beauty-wellness', 'me', 'frizer', 2),
  ('beauty-wellness', 'me', 'frizerski salon', 2),
  ('beauty-wellness', 'me', 'kozmetičar', 2),
  ('beauty-wellness', 'me', 'manikir', 3),
  ('beauty-wellness', 'me', 'pedikir', 3),
  ('beauty-wellness', 'me', 'masaža', 2),
  ('beauty-wellness', 'me', 'depilacija', 3),
  ('beauty-wellness', 'me', 'šminkanje', 2),
  ('beauty-wellness', 'me', 'wellness', 2),
  ('beauty-wellness', 'me', 'spa', 2),

  -- Sırpça (sr)
  ('beauty-wellness', 'sr', 'frizer', 2),
  ('beauty-wellness', 'sr', 'frizerski salon', 2),
  ('beauty-wellness', 'sr', 'kozmetičar', 2),
  ('beauty-wellness', 'sr', 'manikir', 3),
  ('beauty-wellness', 'sr', 'pedikir', 3),
  ('beauty-wellness', 'sr', 'masaža', 2),
  ('beauty-wellness', 'sr', 'depilacija', 3),
  ('beauty-wellness', 'sr', 'šminkanje', 2),
  ('beauty-wellness', 'sr', 'wellness', 2),
  ('beauty-wellness', 'sr', 'spa', 2),

  -- İngilizce (en)
  ('beauty-wellness', 'en', 'hairdresser', 2),
  ('beauty-wellness', 'en', 'barber', 2),
  ('beauty-wellness', 'en', 'salon', 2),
  ('beauty-wellness', 'en', 'beautician', 2),
  ('beauty-wellness', 'en', 'manicure', 3),
  ('beauty-wellness', 'en', 'pedicure', 3),
  ('beauty-wellness', 'en', 'massage', 2),
  ('beauty-wellness', 'en', 'waxing', 3),
  ('beauty-wellness', 'en', 'makeup', 2),
  ('beauty-wellness', 'en', 'spa', 2),
  ('beauty-wellness', 'en', 'wellness', 2),
  ('beauty-wellness', 'en', 'facial', 3),

  -- Türkçe (tr)
  ('beauty-wellness', 'tr', 'kuaför', 2),
  ('beauty-wellness', 'tr', 'berber', 2),
  ('beauty-wellness', 'tr', 'güzellik salonu', 2),
  ('beauty-wellness', 'tr', 'estetisyen', 2),
  ('beauty-wellness', 'tr', 'manikür', 3),
  ('beauty-wellness', 'tr', 'pedikür', 3),
  ('beauty-wellness', 'tr', 'masaj', 2),
  ('beauty-wellness', 'tr', 'ağda', 3),
  ('beauty-wellness', 'tr', 'makyaj', 2),
  ('beauty-wellness', 'tr', 'cilt bakımı', 3),
  ('beauty-wellness', 'tr', 'spa', 2),
  ('beauty-wellness', 'tr', 'wellness', 2),

  -- Almanca (de)
  ('beauty-wellness', 'de', 'friseur', 2),
  ('beauty-wellness', 'de', 'friseursalon', 2),
  ('beauty-wellness', 'de', 'kosmetikerin', 2),
  ('beauty-wellness', 'de', 'maniküre', 3),
  ('beauty-wellness', 'de', 'pediküre', 3),
  ('beauty-wellness', 'de', 'massage', 2),
  ('beauty-wellness', 'de', 'haarentfernung', 3),
  ('beauty-wellness', 'de', 'make-up', 2),
  ('beauty-wellness', 'de', 'gesichtsbehandlung', 3),
  ('beauty-wellness', 'de', 'spa', 2),
  ('beauty-wellness', 'de', 'wellness', 2),

  -- İtalyanca (it)
  ('beauty-wellness', 'it', 'parrucchiere', 2),
  ('beauty-wellness', 'it', 'barbiere', 2),
  ('beauty-wellness', 'it', 'salone di bellezza', 2),
  ('beauty-wellness', 'it', 'estetista', 2),
  ('beauty-wellness', 'it', 'manicure', 3),
  ('beauty-wellness', 'it', 'pedicure', 3),
  ('beauty-wellness', 'it', 'massaggio', 2),
  ('beauty-wellness', 'it', 'depilazione', 3),
  ('beauty-wellness', 'it', 'trucco', 2),
  ('beauty-wellness', 'it', 'pulizia viso', 3),
  ('beauty-wellness', 'it', 'spa', 2),

  -- Rusça (ru)
  ('beauty-wellness', 'ru', 'парикмахер', 2),
  ('beauty-wellness', 'ru', 'салон красоты', 2),
  ('beauty-wellness', 'ru', 'косметолог', 2),
  ('beauty-wellness', 'ru', 'маникюр', 3),
  ('beauty-wellness', 'ru', 'педикюр', 3),
  ('beauty-wellness', 'ru', 'массаж', 2),
  ('beauty-wellness', 'ru', 'депиляция', 3),
  ('beauty-wellness', 'ru', 'макияж', 2),
  ('beauty-wellness', 'ru', 'чистка лица', 3),
  ('beauty-wellness', 'ru', 'спа', 2),
  ('beauty-wellness', 'ru', 'велнес', 2),

  -- Arapça (ar)
  ('beauty-wellness', 'ar', 'مصفف شعر', 2),
  ('beauty-wellness', 'ar', 'صالون', 2),
  ('beauty-wellness', 'ar', 'حلاق', 2),
  ('beauty-wellness', 'ar', 'مانيكير', 3),
  ('beauty-wellness', 'ar', 'باديكير', 3),
  ('beauty-wellness', 'ar', 'مساج', 2),
  ('beauty-wellness', 'ar', 'إزالة الشعر', 3),
  ('beauty-wellness', 'ar', 'مكياج', 2),
  ('beauty-wellness', 'ar', 'تنظيف بشرة', 3),
  ('beauty-wellness', 'ar', 'سبا', 2),

  -- Ukraynaca (uk)
  ('beauty-wellness', 'uk', 'перукар', 2),
  ('beauty-wellness', 'uk', 'салон краси', 2),
  ('beauty-wellness', 'uk', 'косметолог', 2),
  ('beauty-wellness', 'uk', 'манікюр', 3),
  ('beauty-wellness', 'uk', 'педикюр', 3),
  ('beauty-wellness', 'uk', 'масаж', 2),
  ('beauty-wellness', 'uk', 'депіляція', 3),
  ('beauty-wellness', 'uk', 'макіяж', 2),
  ('beauty-wellness', 'uk', 'чистка обличчя', 3),
  ('beauty-wellness', 'uk', 'спа', 2),
  ('beauty-wellness', 'uk', 'велнес', 2);


-- ----------------------------------------------------------------------------
-- 4. Hybrid additions: native daily-speech equivalents alongside loanwords
--    Per Rohat's directive: jargon (loanword) and native both indexed.
-- ----------------------------------------------------------------------------

-- boat-services: native Crnogorski/Srpski for marina jargon
INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- me native daily-speech (weight 2)
  ('boat-services', 'me', 'luka', 2),
  ('boat-services', 'me', 'vez', 2),
  ('boat-services', 'me', 'premaz protiv obraštaja', 2),
  ('boat-services', 'me', 'donji premaz', 2),
  ('boat-services', 'me', 'zaštitni sloj', 2),
  ('boat-services', 'me', 'oštećenja od vlage', 2),
  ('boat-services', 'me', 'mehurići u gelcoatu', 2),
  ('boat-services', 'me', 'vađenje na suvo', 2),
  ('boat-services', 'me', 'kran', 2),
  ('boat-services', 'me', 'dizalica', 2),
  -- sr native (mirrors me; sr/me share Štokavian core for boating terms)
  ('boat-services', 'sr', 'luka', 2),
  ('boat-services', 'sr', 'vez', 2),
  ('boat-services', 'sr', 'premaz protiv obraštaja', 2),
  ('boat-services', 'sr', 'donji premaz', 2),
  ('boat-services', 'sr', 'zaštitni sloj', 2),
  ('boat-services', 'sr', 'oštećenja od vlage', 2),
  ('boat-services', 'sr', 'mehurići u gelkotu', 2),
  ('boat-services', 'sr', 'vađenje na suvo', 2),
  ('boat-services', 'sr', 'kran', 2),
  ('boat-services', 'sr', 'dizalica', 2);


-- ----------------------------------------------------------------------------
-- 5. Arabic parity boost (per Rohat: 11-12 syn/category, MSA + EN loanwords)
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- boat-services ar: 9 -> 12
  ('boat-services', 'ar', 'صيانة القارب', 3),
  ('boat-services', 'ar', 'إصلاح المحرك البحري', 3),
  ('boat-services', 'ar', 'تخزين القارب', 3),

  -- home-cleaning ar: 8 -> 12
  ('home-cleaning', 'ar', 'تنظيف ما بعد البناء', 3),
  ('home-cleaning', 'ar', 'تنظيف أسبوعي', 3),
  ('home-cleaning', 'ar', 'تنظيف موسمي', 3),
  ('home-cleaning', 'ar', 'مدبرة منزل', 2),

  -- beauty-wellness ar: 10 -> 12
  ('beauty-wellness', 'ar', 'صبغ شعر', 3),
  ('beauty-wellness', 'ar', 'علاج تجميلي', 3);

COMMIT;
