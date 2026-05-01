-- ============================================================================
-- 019_glatko_search_synonyms_seed_batch3.sql
-- G-CAT-3: Sectoral synonym seed — BATCH 3 (sub-categories of 5 roots)
--
-- Sub-categories under home-cleaning, beauty-wellness, renovation-
-- construction, catering-food, tutoring-education. Sub-cats already
-- direct-match via their localized name in search_text; this file adds
-- only specific jargon / alternative names that aren't in the names.
--
-- Density: 3 syn per locale per sub (lean — recall comes mostly from
-- direct match + parent synonyms). All weight 3.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- HOME-CLEANING SUBS (7): regular, deep, airbnb-turnover, carpet, window,
-- post-construction, villa
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- regular-cleaning
  ('regular-cleaning', 'me', 'redovno čišćenje', 3), ('regular-cleaning', 'me', 'sedmično čišćenje', 3), ('regular-cleaning', 'me', 'mjesečno čišćenje', 3),
  ('regular-cleaning', 'sr', 'redovno čišćenje', 3), ('regular-cleaning', 'sr', 'sedmično čišćenje', 3), ('regular-cleaning', 'sr', 'mesečno čišćenje', 3),
  ('regular-cleaning', 'en', 'recurring cleaning', 3), ('regular-cleaning', 'en', 'weekly cleaning', 3), ('regular-cleaning', 'en', 'monthly cleaning', 3),
  ('regular-cleaning', 'tr', 'rutin temizlik', 3), ('regular-cleaning', 'tr', 'haftalık temizlik', 3), ('regular-cleaning', 'tr', 'aylık temizlik', 3),
  ('regular-cleaning', 'de', 'regelmäßige reinigung', 3), ('regular-cleaning', 'de', 'wöchentliche reinigung', 3), ('regular-cleaning', 'de', 'monatliche reinigung', 3),
  ('regular-cleaning', 'it', 'pulizia ricorrente', 3), ('regular-cleaning', 'it', 'pulizia settimanale', 3), ('regular-cleaning', 'it', 'pulizia mensile', 3),
  ('regular-cleaning', 'ru', 'регулярная уборка', 3), ('regular-cleaning', 'ru', 'еженедельная уборка', 3), ('regular-cleaning', 'ru', 'ежемесячная уборка', 3),
  ('regular-cleaning', 'ar', 'تنظيف منتظم', 3), ('regular-cleaning', 'ar', 'تنظيف أسبوعي', 3), ('regular-cleaning', 'ar', 'تنظيف شهري', 3),
  ('regular-cleaning', 'uk', 'регулярне прибирання', 3), ('regular-cleaning', 'uk', 'щотижневе прибирання', 3), ('regular-cleaning', 'uk', 'щомісячне прибирання', 3),
  -- deep-cleaning
  ('deep-cleaning', 'me', 'detaljno čišćenje', 3), ('deep-cleaning', 'me', 'generalka', 3), ('deep-cleaning', 'me', 'kapitalno čišćenje', 3),
  ('deep-cleaning', 'sr', 'detaljno čišćenje', 3), ('deep-cleaning', 'sr', 'generalka', 3), ('deep-cleaning', 'sr', 'kapitalno čišćenje', 3),
  ('deep-cleaning', 'en', 'deep clean', 3), ('deep-cleaning', 'en', 'spring clean', 3), ('deep-cleaning', 'en', 'thorough cleaning', 3),
  ('deep-cleaning', 'tr', 'detaylı temizlik', 3), ('deep-cleaning', 'tr', 'genel temizlik', 3), ('deep-cleaning', 'tr', 'baharlık temizlik', 3),
  ('deep-cleaning', 'de', 'grundreinigung', 3), ('deep-cleaning', 'de', 'tiefenreinigung', 3), ('deep-cleaning', 'de', 'intensivreinigung', 3),
  ('deep-cleaning', 'it', 'pulizia profonda', 3), ('deep-cleaning', 'it', 'pulizia accurata', 3), ('deep-cleaning', 'it', 'pulizia totale', 3),
  ('deep-cleaning', 'ru', 'генеральная уборка', 3), ('deep-cleaning', 'ru', 'глубокая чистка', 3), ('deep-cleaning', 'ru', 'тщательная уборка', 3),
  ('deep-cleaning', 'ar', 'تنظيف عميق', 3), ('deep-cleaning', 'ar', 'تنظيف شامل', 3), ('deep-cleaning', 'ar', 'تنظيف موسمي', 3),
  ('deep-cleaning', 'uk', 'глибоке прибирання', 3), ('deep-cleaning', 'uk', 'генеральне прибирання', 3), ('deep-cleaning', 'uk', 'ретельне прибирання', 3),
  -- airbnb-turnover
  ('airbnb-turnover', 'me', 'čišćenje između gostiju', 3), ('airbnb-turnover', 'me', 'turn-over čišćenje', 3), ('airbnb-turnover', 'me', 'predaja stana', 3),
  ('airbnb-turnover', 'sr', 'čišćenje između gostiju', 3), ('airbnb-turnover', 'sr', 'turn-over čišćenje', 3), ('airbnb-turnover', 'sr', 'predaja stana', 3),
  ('airbnb-turnover', 'en', 'turnover cleaning', 3), ('airbnb-turnover', 'en', 'between guests cleaning', 3), ('airbnb-turnover', 'en', 'str cleaning', 3),
  ('airbnb-turnover', 'tr', 'giriş çıkış temizliği', 3), ('airbnb-turnover', 'tr', 'konuk arası temizlik', 3), ('airbnb-turnover', 'tr', 'airbnb temizlik', 3),
  ('airbnb-turnover', 'de', 'gästewechselreinigung', 3), ('airbnb-turnover', 'de', 'turnover-reinigung', 3), ('airbnb-turnover', 'de', 'fewo-reinigung', 3),
  ('airbnb-turnover', 'it', 'pulizia turn-over', 3), ('airbnb-turnover', 'it', 'pulizia tra ospiti', 3), ('airbnb-turnover', 'it', 'pulizia airbnb', 3),
  ('airbnb-turnover', 'ru', 'уборка между гостями', 3), ('airbnb-turnover', 'ru', 'турновер уборка', 3), ('airbnb-turnover', 'ru', 'уборка после съёмщиков', 3),
  ('airbnb-turnover', 'ar', 'تنظيف بين الضيوف', 3), ('airbnb-turnover', 'ar', 'تنظيف ايربنب', 3), ('airbnb-turnover', 'ar', 'تنظيف بعد المستأجرين', 3),
  ('airbnb-turnover', 'uk', 'прибирання між гостями', 3), ('airbnb-turnover', 'uk', 'турновер прибирання', 3), ('airbnb-turnover', 'uk', 'прибирання airbnb', 3),
  -- carpet-washing
  ('carpet-washing', 'me', 'pranje tepiha', 3), ('carpet-washing', 'me', 'čišćenje tepiha', 3), ('carpet-washing', 'me', 'dubinsko pranje tepiha', 3),
  ('carpet-washing', 'sr', 'pranje tepiha', 3), ('carpet-washing', 'sr', 'čišćenje tepiha', 3), ('carpet-washing', 'sr', 'dubinsko pranje tepiha', 3),
  ('carpet-washing', 'en', 'carpet cleaning', 3), ('carpet-washing', 'en', 'rug cleaning', 3), ('carpet-washing', 'en', 'carpet shampooing', 3),
  ('carpet-washing', 'tr', 'halı yıkama', 3), ('carpet-washing', 'tr', 'kilim yıkama', 3), ('carpet-washing', 'tr', 'halı temizliği', 3),
  ('carpet-washing', 'de', 'teppichreinigung', 3), ('carpet-washing', 'de', 'teppichwäsche', 3), ('carpet-washing', 'de', 'teppichshampoo', 3),
  ('carpet-washing', 'it', 'pulitura tappeti', 3), ('carpet-washing', 'it', 'lavaggio tappeti', 3), ('carpet-washing', 'it', 'pulizia moquette', 3),
  ('carpet-washing', 'ru', 'химчистка ковров', 3), ('carpet-washing', 'ru', 'чистка ковра', 3), ('carpet-washing', 'ru', 'мойка ковров', 3),
  ('carpet-washing', 'ar', 'تنظيف السجاد', 3), ('carpet-washing', 'ar', 'غسيل سجاد', 3), ('carpet-washing', 'ar', 'شامبو السجاد', 3),
  ('carpet-washing', 'uk', 'хімчистка килимів', 3), ('carpet-washing', 'uk', 'чистка килима', 3), ('carpet-washing', 'uk', 'миття килимів', 3),
  -- window-cleaning
  ('window-cleaning', 'me', 'pranje prozora', 3), ('window-cleaning', 'me', 'čišćenje stakla', 3), ('window-cleaning', 'me', 'brisanje prozora', 3),
  ('window-cleaning', 'sr', 'pranje prozora', 3), ('window-cleaning', 'sr', 'čišćenje stakla', 3), ('window-cleaning', 'sr', 'brisanje prozora', 3),
  ('window-cleaning', 'en', 'glass cleaning', 3), ('window-cleaning', 'en', 'window washing', 3), ('window-cleaning', 'en', 'window washer', 3),
  ('window-cleaning', 'tr', 'cam silme', 3), ('window-cleaning', 'tr', 'cam temizliği', 3), ('window-cleaning', 'tr', 'pencere yıkama', 3),
  ('window-cleaning', 'de', 'fensterputzen', 3), ('window-cleaning', 'de', 'fensterreinigung', 3), ('window-cleaning', 'de', 'glasreinigung', 3),
  ('window-cleaning', 'it', 'lavavetri', 3), ('window-cleaning', 'it', 'pulizia vetri', 3), ('window-cleaning', 'it', 'pulizia finestre', 3),
  ('window-cleaning', 'ru', 'мытье окон', 3), ('window-cleaning', 'ru', 'чистка стекол', 3), ('window-cleaning', 'ru', 'мойка окон', 3),
  ('window-cleaning', 'ar', 'تنظيف النوافذ', 3), ('window-cleaning', 'ar', 'تنظيف الزجاج', 3), ('window-cleaning', 'ar', 'مسح الزجاج', 3),
  ('window-cleaning', 'uk', 'миття вікон', 3), ('window-cleaning', 'uk', 'чистка скла', 3), ('window-cleaning', 'uk', 'мийка вікон', 3),
  -- post-construction
  ('post-construction', 'me', 'čišćenje nakon građevinskih radova', 3), ('post-construction', 'me', 'post-renovacija čišćenje', 3), ('post-construction', 'me', 'gradilište čišćenje', 3),
  ('post-construction', 'sr', 'čišćenje nakon građevinskih radova', 3), ('post-construction', 'sr', 'post-renovacija čišćenje', 3), ('post-construction', 'sr', 'gradilište čišćenje', 3),
  ('post-construction', 'en', 'after renovation cleaning', 3), ('post-construction', 'en', 'builders cleaning', 3), ('post-construction', 'en', 'construction cleanup', 3),
  ('post-construction', 'tr', 'inşaat sonrası temizlik', 3), ('post-construction', 'tr', 'kaba temizlik', 3), ('post-construction', 'tr', 'ince temizlik', 3),
  ('post-construction', 'de', 'bauschlussreinigung', 3), ('post-construction', 'de', 'baureinigung', 3), ('post-construction', 'de', 'endreinigung baustelle', 3),
  ('post-construction', 'it', 'pulizia post-cantiere', 3), ('post-construction', 'it', 'pulizia post-ristrutturazione', 3), ('post-construction', 'it', 'fine cantiere', 3),
  ('post-construction', 'ru', 'уборка после ремонта', 3), ('post-construction', 'ru', 'послеремонтная уборка', 3), ('post-construction', 'ru', 'уборка после стройки', 3),
  ('post-construction', 'ar', 'تنظيف بعد البناء', 3), ('post-construction', 'ar', 'تنظيف بعد الترميم', 3), ('post-construction', 'ar', 'تنظيف ما بعد ورش', 3),
  ('post-construction', 'uk', 'прибирання після ремонту', 3), ('post-construction', 'uk', 'післяремонтне прибирання', 3), ('post-construction', 'uk', 'прибирання після будівництва', 3),
  -- villa-cleaning
  ('villa-cleaning', 'me', 'čišćenje vile', 3), ('villa-cleaning', 'me', 'pranje vile', 3), ('villa-cleaning', 'me', 'kompletno čišćenje vile', 3),
  ('villa-cleaning', 'sr', 'čišćenje vile', 3), ('villa-cleaning', 'sr', 'pranje vile', 3), ('villa-cleaning', 'sr', 'kompletno čišćenje vile', 3),
  ('villa-cleaning', 'en', 'holiday home cleaning', 3), ('villa-cleaning', 'en', 'vacation rental cleaning', 3), ('villa-cleaning', 'en', 'estate cleaning', 3),
  ('villa-cleaning', 'tr', 'villa temizliği', 3), ('villa-cleaning', 'tr', 'yazlık temizliği', 3), ('villa-cleaning', 'tr', 'müstakil ev temizliği', 3),
  ('villa-cleaning', 'de', 'villenreinigung', 3), ('villa-cleaning', 'de', 'ferienhausreinigung', 3), ('villa-cleaning', 'de', 'urlaubshausreinigung', 3),
  ('villa-cleaning', 'it', 'pulizia ville', 3), ('villa-cleaning', 'it', 'pulizia case vacanze', 3), ('villa-cleaning', 'it', 'pulizia residence', 3),
  ('villa-cleaning', 'ru', 'уборка вилл', 3), ('villa-cleaning', 'ru', 'уборка коттеджей', 3), ('villa-cleaning', 'ru', 'уборка дач', 3),
  ('villa-cleaning', 'ar', 'تنظيف فيلا', 3), ('villa-cleaning', 'ar', 'تنظيف منازل عطلات', 3), ('villa-cleaning', 'ar', 'تنظيف بيوت ريفية', 3),
  ('villa-cleaning', 'uk', 'прибирання вілл', 3), ('villa-cleaning', 'uk', 'прибирання котеджів', 3), ('villa-cleaning', 'uk', 'прибирання дач', 3);


-- ----------------------------------------------------------------------------
-- BEAUTY-WELLNESS SUBS (9): hair-salon, manicure-pedicure, permanent-makeup,
-- facial-skincare, massage, brow-design, bridal-prep, hair-extensions,
-- laser-hair-removal
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- hair-salon
  ('hair-salon', 'me', 'frizerski salon', 3), ('hair-salon', 'me', 'šišanje', 3), ('hair-salon', 'me', 'farbanje kose', 3),
  ('hair-salon', 'sr', 'frizerski salon', 3), ('hair-salon', 'sr', 'šišanje', 3), ('hair-salon', 'sr', 'farbanje kose', 3),
  ('hair-salon', 'en', 'haircut', 3), ('hair-salon', 'en', 'hair color', 3), ('hair-salon', 'en', 'hair styling', 3),
  ('hair-salon', 'tr', 'kuaför salonu', 3), ('hair-salon', 'tr', 'saç kesim', 3), ('hair-salon', 'tr', 'saç boyama', 3),
  ('hair-salon', 'de', 'haarschnitt', 3), ('hair-salon', 'de', 'haarfärben', 3), ('hair-salon', 'de', 'haarstyling', 3),
  ('hair-salon', 'it', 'taglio capelli', 3), ('hair-salon', 'it', 'colore capelli', 3), ('hair-salon', 'it', 'piega', 3),
  ('hair-salon', 'ru', 'стрижка', 3), ('hair-salon', 'ru', 'покраска волос', 3), ('hair-salon', 'ru', 'укладка', 3),
  ('hair-salon', 'ar', 'قص شعر', 3), ('hair-salon', 'ar', 'صبغ شعر', 3), ('hair-salon', 'ar', 'تصفيف شعر', 3),
  ('hair-salon', 'uk', 'стрижка', 3), ('hair-salon', 'uk', 'фарбування волосся', 3), ('hair-salon', 'uk', 'укладка', 3),
  -- manicure-pedicure
  ('manicure-pedicure', 'me', 'manikir pedikir', 3), ('manicure-pedicure', 'me', 'gel lak', 3), ('manicure-pedicure', 'me', 'nokti', 3),
  ('manicure-pedicure', 'sr', 'manikir pedikir', 3), ('manicure-pedicure', 'sr', 'gel lak', 3), ('manicure-pedicure', 'sr', 'nokti', 3),
  ('manicure-pedicure', 'en', 'gel nails', 3), ('manicure-pedicure', 'en', 'nail art', 3), ('manicure-pedicure', 'en', 'nail salon', 3),
  ('manicure-pedicure', 'tr', 'manikür pedikür', 3), ('manicure-pedicure', 'tr', 'jel oje', 3), ('manicure-pedicure', 'tr', 'tırnak', 3),
  ('manicure-pedicure', 'de', 'gellack', 3), ('manicure-pedicure', 'de', 'nagelstudio', 3), ('manicure-pedicure', 'de', 'nageldesign', 3),
  ('manicure-pedicure', 'it', 'unghie gel', 3), ('manicure-pedicure', 'it', 'nail art', 3), ('manicure-pedicure', 'it', 'estetica unghie', 3),
  ('manicure-pedicure', 'ru', 'гель-лак', 3), ('manicure-pedicure', 'ru', 'наращивание ногтей', 3), ('manicure-pedicure', 'ru', 'дизайн ногтей', 3),
  ('manicure-pedicure', 'ar', 'مانيكير باديكير', 3), ('manicure-pedicure', 'ar', 'جل أظافر', 3), ('manicure-pedicure', 'ar', 'فن الأظافر', 3),
  ('manicure-pedicure', 'uk', 'гель-лак', 3), ('manicure-pedicure', 'uk', 'нарощування нігтів', 3), ('manicure-pedicure', 'uk', 'дизайн нігтів', 3),
  -- permanent-makeup
  ('permanent-makeup', 'me', 'permanent makeup', 3), ('permanent-makeup', 'me', 'mikropigmentacija', 3), ('permanent-makeup', 'me', 'trajna šminka', 3),
  ('permanent-makeup', 'sr', 'permanent makeup', 3), ('permanent-makeup', 'sr', 'mikropigmentacija', 3), ('permanent-makeup', 'sr', 'trajna šminka', 3),
  ('permanent-makeup', 'en', 'pmu', 3), ('permanent-makeup', 'en', 'micropigmentation', 3), ('permanent-makeup', 'en', 'cosmetic tattoo', 3),
  ('permanent-makeup', 'tr', 'kalıcı makyaj', 3), ('permanent-makeup', 'tr', 'mikropigmentasyon', 3), ('permanent-makeup', 'tr', 'kontür makyaj', 3),
  ('permanent-makeup', 'de', 'permanent make-up', 3), ('permanent-makeup', 'de', 'mikropigmentierung', 3), ('permanent-makeup', 'de', 'kosmetisches tattoo', 3),
  ('permanent-makeup', 'it', 'trucco semipermanente', 3), ('permanent-makeup', 'it', 'micropigmentazione', 3), ('permanent-makeup', 'it', 'tatuaggio cosmetico', 3),
  ('permanent-makeup', 'ru', 'перманентный макияж', 3), ('permanent-makeup', 'ru', 'микропигментация', 3), ('permanent-makeup', 'ru', 'татуаж', 3),
  ('permanent-makeup', 'ar', 'مكياج دائم', 3), ('permanent-makeup', 'ar', 'تاتو تجميلي', 3), ('permanent-makeup', 'ar', 'وشم تجميلي', 3),
  ('permanent-makeup', 'uk', 'перманентний макіяж', 3), ('permanent-makeup', 'uk', 'мікропігментація', 3), ('permanent-makeup', 'uk', 'татуаж', 3),
  -- facial-skincare
  ('facial-skincare', 'me', 'tretman lica', 3), ('facial-skincare', 'me', 'čišćenje lica', 3), ('facial-skincare', 'me', 'nega kože', 3),
  ('facial-skincare', 'sr', 'tretman lica', 3), ('facial-skincare', 'sr', 'čišćenje lica', 3), ('facial-skincare', 'sr', 'nega kože', 3),
  ('facial-skincare', 'en', 'facial', 3), ('facial-skincare', 'en', 'skin treatment', 3), ('facial-skincare', 'en', 'hydrafacial', 3),
  ('facial-skincare', 'tr', 'cilt bakımı', 3), ('facial-skincare', 'tr', 'yüz bakımı', 3), ('facial-skincare', 'tr', 'hydrafacial', 3),
  ('facial-skincare', 'de', 'gesichtsbehandlung', 3), ('facial-skincare', 'de', 'gesichtspflege', 3), ('facial-skincare', 'de', 'hautpflege', 3),
  ('facial-skincare', 'it', 'trattamento viso', 3), ('facial-skincare', 'it', 'pulizia viso', 3), ('facial-skincare', 'it', 'cura della pelle', 3),
  ('facial-skincare', 'ru', 'чистка лица', 3), ('facial-skincare', 'ru', 'уход за кожей', 3), ('facial-skincare', 'ru', 'гидрафейшл', 3),
  ('facial-skincare', 'ar', 'تنظيف بشرة', 3), ('facial-skincare', 'ar', 'علاج وجه', 3), ('facial-skincare', 'ar', 'العناية بالبشرة', 3),
  ('facial-skincare', 'uk', 'чистка обличчя', 3), ('facial-skincare', 'uk', 'догляд за шкірою', 3), ('facial-skincare', 'uk', 'гідрафейшл', 3),
  -- massage
  ('massage', 'me', 'masaža tijela', 3), ('massage', 'me', 'relaks masaža', 3), ('massage', 'me', 'sportska masaža', 3),
  ('massage', 'sr', 'masaža tela', 3), ('massage', 'sr', 'relaks masaža', 3), ('massage', 'sr', 'sportska masaža', 3),
  ('massage', 'en', 'body massage', 3), ('massage', 'en', 'deep tissue massage', 3), ('massage', 'en', 'thai massage', 3),
  ('massage', 'tr', 'vücut masajı', 3), ('massage', 'tr', 'derin doku masajı', 3), ('massage', 'tr', 'tay masajı', 3),
  ('massage', 'de', 'körpermassage', 3), ('massage', 'de', 'tiefenmassage', 3), ('massage', 'de', 'thai-massage', 3),
  ('massage', 'it', 'massaggio corpo', 3), ('massage', 'it', 'massaggio profondo', 3), ('massage', 'it', 'massaggio thai', 3),
  ('massage', 'ru', 'массаж тела', 3), ('massage', 'ru', 'глубокий массаж', 3), ('massage', 'ru', 'тайский массаж', 3),
  ('massage', 'ar', 'مساج جسم', 3), ('massage', 'ar', 'مساج عميق', 3), ('massage', 'ar', 'مساج تايلندي', 3),
  ('massage', 'uk', 'масаж тіла', 3), ('massage', 'uk', 'глибокий масаж', 3), ('massage', 'uk', 'тайський масаж', 3),
  -- brow-design
  ('brow-design', 'me', 'oblikovanje obrva', 3), ('brow-design', 'me', 'laminacija obrva', 3), ('brow-design', 'me', 'henna obrve', 3),
  ('brow-design', 'sr', 'oblikovanje obrva', 3), ('brow-design', 'sr', 'laminacija obrva', 3), ('brow-design', 'sr', 'henna obrve', 3),
  ('brow-design', 'en', 'brow lamination', 3), ('brow-design', 'en', 'brow shaping', 3), ('brow-design', 'en', 'brow tinting', 3),
  ('brow-design', 'tr', 'kaş tasarımı', 3), ('brow-design', 'tr', 'kaş laminasyon', 3), ('brow-design', 'tr', 'kaş boyama', 3),
  ('brow-design', 'de', 'augenbrauen styling', 3), ('brow-design', 'de', 'augenbrauen lamination', 3), ('brow-design', 'de', 'augenbrauen färben', 3),
  ('brow-design', 'it', 'design sopracciglia', 3), ('brow-design', 'it', 'laminazione sopracciglia', 3), ('brow-design', 'it', 'tinta sopracciglia', 3),
  ('brow-design', 'ru', 'оформление бровей', 3), ('brow-design', 'ru', 'ламинирование бровей', 3), ('brow-design', 'ru', 'окрашивание бровей', 3),
  ('brow-design', 'ar', 'تصميم حواجب', 3), ('brow-design', 'ar', 'لامينيشن حواجب', 3), ('brow-design', 'ar', 'صبغ حواجب', 3),
  ('brow-design', 'uk', 'оформлення брів', 3), ('brow-design', 'uk', 'ламінування брів', 3), ('brow-design', 'uk', 'фарбування брів', 3),
  -- bridal-prep
  ('bridal-prep', 'me', 'mladenačka šminka', 3), ('bridal-prep', 'me', 'frizura za vjenčanje', 3), ('bridal-prep', 'me', 'svadbeni stajling', 3),
  ('bridal-prep', 'sr', 'mladenačka šminka', 3), ('bridal-prep', 'sr', 'frizura za venčanje', 3), ('bridal-prep', 'sr', 'svadbeni stajling', 3),
  ('bridal-prep', 'en', 'bridal makeup', 3), ('bridal-prep', 'en', 'wedding hair', 3), ('bridal-prep', 'en', 'wedding styling', 3),
  ('bridal-prep', 'tr', 'gelin makyajı', 3), ('bridal-prep', 'tr', 'gelin saçı', 3), ('bridal-prep', 'tr', 'düğün saç makyaj', 3),
  ('bridal-prep', 'de', 'brautstyling', 3), ('bridal-prep', 'de', 'brautmakeup', 3), ('bridal-prep', 'de', 'brautfrisur', 3),
  ('bridal-prep', 'it', 'trucco sposa', 3), ('bridal-prep', 'it', 'acconciatura sposa', 3), ('bridal-prep', 'it', 'styling matrimonio', 3),
  ('bridal-prep', 'ru', 'свадебный макияж', 3), ('bridal-prep', 'ru', 'свадебная прическа', 3), ('bridal-prep', 'ru', 'образ невесты', 3),
  ('bridal-prep', 'ar', 'مكياج عروس', 3), ('bridal-prep', 'ar', 'تسريحة عروس', 3), ('bridal-prep', 'ar', 'تجهيز العروس', 3),
  ('bridal-prep', 'uk', 'весільний макіяж', 3), ('bridal-prep', 'uk', 'весільна зачіска', 3), ('bridal-prep', 'uk', 'образ нареченої', 3),
  -- hair-extensions
  ('hair-extensions', 'me', 'nadogradnja kose', 3), ('hair-extensions', 'me', 'ekstenzije', 3), ('hair-extensions', 'me', 'umetci za kosu', 3),
  ('hair-extensions', 'sr', 'nadogradnja kose', 3), ('hair-extensions', 'sr', 'ekstenzije', 3), ('hair-extensions', 'sr', 'umetci za kosu', 3),
  ('hair-extensions', 'en', 'hair extension', 3), ('hair-extensions', 'en', 'tape-in extensions', 3), ('hair-extensions', 'en', 'keratin extensions', 3),
  ('hair-extensions', 'tr', 'saç kaynak', 3), ('hair-extensions', 'tr', 'saç ekleme', 3), ('hair-extensions', 'tr', 'keratin kaynak', 3),
  ('hair-extensions', 'de', 'haarverlängerung', 3), ('hair-extensions', 'de', 'extensions', 3), ('hair-extensions', 'de', 'tape extensions', 3),
  ('hair-extensions', 'it', 'extension capelli', 3), ('hair-extensions', 'it', 'allungamento capelli', 3), ('hair-extensions', 'it', 'cheratina extensions', 3),
  ('hair-extensions', 'ru', 'наращивание волос', 3), ('hair-extensions', 'ru', 'капсульное наращивание', 3), ('hair-extensions', 'ru', 'ленточное наращивание', 3),
  ('hair-extensions', 'ar', 'وصلات شعر', 3), ('hair-extensions', 'ar', 'إطالة الشعر', 3), ('hair-extensions', 'ar', 'وصلات كيراتين', 3),
  ('hair-extensions', 'uk', 'нарощування волосся', 3), ('hair-extensions', 'uk', 'капсульне нарощування', 3), ('hair-extensions', 'uk', 'стрічкове нарощування', 3),
  -- laser-hair-removal
  ('laser-hair-removal', 'me', 'lasersko uklanjanje dlačica', 3), ('laser-hair-removal', 'me', 'lasersko depiliranje', 3), ('laser-hair-removal', 'me', 'ipl tretman', 3),
  ('laser-hair-removal', 'sr', 'lasersko uklanjanje dlačica', 3), ('laser-hair-removal', 'sr', 'lasersko depiliranje', 3), ('laser-hair-removal', 'sr', 'ipl tretman', 3),
  ('laser-hair-removal', 'en', 'laser depilation', 3), ('laser-hair-removal', 'en', 'ipl', 3), ('laser-hair-removal', 'en', 'permanent hair removal', 3),
  ('laser-hair-removal', 'tr', 'lazer epilasyon', 3), ('laser-hair-removal', 'tr', 'kalıcı epilasyon', 3), ('laser-hair-removal', 'tr', 'ipl epilasyon', 3),
  ('laser-hair-removal', 'de', 'laser haarentfernung', 3), ('laser-hair-removal', 'de', 'ipl-behandlung', 3), ('laser-hair-removal', 'de', 'dauerhafte haarentfernung', 3),
  ('laser-hair-removal', 'it', 'depilazione laser', 3), ('laser-hair-removal', 'it', 'epilazione laser', 3), ('laser-hair-removal', 'it', 'ipl', 3),
  ('laser-hair-removal', 'ru', 'лазерная эпиляция', 3), ('laser-hair-removal', 'ru', 'ipl эпиляция', 3), ('laser-hair-removal', 'ru', 'удаление волос лазером', 3),
  ('laser-hair-removal', 'ar', 'إزالة شعر بالليزر', 3), ('laser-hair-removal', 'ar', 'ليزر تجميلي', 3), ('laser-hair-removal', 'ar', 'إزالة دائمة للشعر', 3),
  ('laser-hair-removal', 'uk', 'лазерна епіляція', 3), ('laser-hair-removal', 'uk', 'ipl епіляція', 3), ('laser-hair-removal', 'uk', 'видалення волосся лазером', 3);


-- ----------------------------------------------------------------------------
-- RENOVATION-CONSTRUCTION SUBS (8): painting, electrical, plumbing, tiling,
-- carpentry-built-in, drywall, flooring, furniture-assembly
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- painting
  ('painting', 'me', 'molerski radovi', 3), ('painting', 'me', 'krečenje', 3), ('painting', 'me', 'farbanje zidova', 3),
  ('painting', 'sr', 'molerski radovi', 3), ('painting', 'sr', 'krečenje', 3), ('painting', 'sr', 'farbanje zidova', 3),
  ('painting', 'en', 'house painting', 3), ('painting', 'en', 'wall painting', 3), ('painting', 'en', 'interior painting', 3),
  ('painting', 'tr', 'iç boya', 3), ('painting', 'tr', 'duvar boyası', 3), ('painting', 'tr', 'badana', 3),
  ('painting', 'de', 'wandanstrich', 3), ('painting', 'de', 'wohnung streichen', 3), ('painting', 'de', 'innenanstrich', 3),
  ('painting', 'it', 'tinteggiatura', 3), ('painting', 'it', 'imbiancare', 3), ('painting', 'it', 'pittura interni', 3),
  ('painting', 'ru', 'покраска стен', 3), ('painting', 'ru', 'малярные работы', 3), ('painting', 'ru', 'окраска квартиры', 3),
  ('painting', 'ar', 'دهان جدران', 3), ('painting', 'ar', 'دهان داخلي', 3), ('painting', 'ar', 'طلاء حوائط', 3),
  ('painting', 'uk', 'фарбування стін', 3), ('painting', 'uk', 'малярні роботи', 3), ('painting', 'uk', 'фарбування квартири', 3),
  -- electrical
  ('electrical', 'me', 'električne instalacije', 3), ('electrical', 'me', 'električar', 3), ('electrical', 'me', 'utičnice', 3),
  ('electrical', 'sr', 'električne instalacije', 3), ('electrical', 'sr', 'električar', 3), ('electrical', 'sr', 'utičnice', 3),
  ('electrical', 'en', 'electrical wiring', 3), ('electrical', 'en', 'outlet installation', 3), ('electrical', 'en', 'electrical work', 3),
  ('electrical', 'tr', 'elektrik tesisatı', 3), ('electrical', 'tr', 'priz montajı', 3), ('electrical', 'tr', 'kablo döşeme', 3),
  ('electrical', 'de', 'elektroinstallation', 3), ('electrical', 'de', 'steckdosen montieren', 3), ('electrical', 'de', 'verkabelung', 3),
  ('electrical', 'it', 'impianto elettrico', 3), ('electrical', 'it', 'installazione prese', 3), ('electrical', 'it', 'cablaggio', 3),
  ('electrical', 'ru', 'электропроводка', 3), ('electrical', 'ru', 'установка розеток', 3), ('electrical', 'ru', 'электромонтаж', 3),
  ('electrical', 'ar', 'تمديدات كهربائية', 3), ('electrical', 'ar', 'تركيب مقابس', 3), ('electrical', 'ar', 'أعمال كهرباء', 3),
  ('electrical', 'uk', 'електропроводка', 3), ('electrical', 'uk', 'встановлення розеток', 3), ('electrical', 'uk', 'електромонтаж', 3),
  -- plumbing
  ('plumbing', 'me', 'vodoinstalacije', 3), ('plumbing', 'me', 'cijevi', 3), ('plumbing', 'me', 'slavina', 3),
  ('plumbing', 'sr', 'vodoinstalacije', 3), ('plumbing', 'sr', 'cevi', 3), ('plumbing', 'sr', 'slavina', 3),
  ('plumbing', 'en', 'pipe repair', 3), ('plumbing', 'en', 'leak fix', 3), ('plumbing', 'en', 'faucet installation', 3),
  ('plumbing', 'tr', 'su tesisatı', 3), ('plumbing', 'tr', 'musluk tamiri', 3), ('plumbing', 'tr', 'sıhhi tesisat', 3),
  ('plumbing', 'de', 'wasserinstallation', 3), ('plumbing', 'de', 'rohrreparatur', 3), ('plumbing', 'de', 'wasserhahn montieren', 3),
  ('plumbing', 'it', 'impianto idraulico', 3), ('plumbing', 'it', 'riparazione tubi', 3), ('plumbing', 'it', 'rubinetto', 3),
  ('plumbing', 'ru', 'сантехнические работы', 3), ('plumbing', 'ru', 'ремонт труб', 3), ('plumbing', 'ru', 'установка крана', 3),
  ('plumbing', 'ar', 'سباكة', 3), ('plumbing', 'ar', 'إصلاح أنابيب', 3), ('plumbing', 'ar', 'تركيب صنبور', 3),
  ('plumbing', 'uk', 'сантехнічні роботи', 3), ('plumbing', 'uk', 'ремонт труб', 3), ('plumbing', 'uk', 'встановлення крана', 3),
  -- tiling
  ('tiling', 'me', 'postavljanje pločica', 3), ('tiling', 'me', 'keramičarski radovi', 3), ('tiling', 'me', 'fugovanje', 3),
  ('tiling', 'sr', 'postavljanje pločica', 3), ('tiling', 'sr', 'keramičarski radovi', 3), ('tiling', 'sr', 'fugovanje', 3),
  ('tiling', 'en', 'tile installation', 3), ('tiling', 'en', 'bathroom tiling', 3), ('tiling', 'en', 'grouting', 3),
  ('tiling', 'tr', 'fayans döşeme', 3), ('tiling', 'tr', 'seramik döşeme', 3), ('tiling', 'tr', 'derz dolgu', 3),
  ('tiling', 'de', 'fliesen verlegen', 3), ('tiling', 'de', 'badezimmerfliesen', 3), ('tiling', 'de', 'verfugen', 3),
  ('tiling', 'it', 'posa piastrelle', 3), ('tiling', 'it', 'piastrellare bagno', 3), ('tiling', 'it', 'stuccatura fughe', 3),
  ('tiling', 'ru', 'укладка плитки', 3), ('tiling', 'ru', 'плитка ванная', 3), ('tiling', 'ru', 'затирка швов', 3),
  ('tiling', 'ar', 'تركيب بلاط', 3), ('tiling', 'ar', 'بلاط حمام', 3), ('tiling', 'ar', 'لياسة فواصل', 3),
  ('tiling', 'uk', 'укладання плитки', 3), ('tiling', 'uk', 'плитка ванна', 3), ('tiling', 'uk', 'затирка швів', 3),
  -- carpentry-built-in
  ('carpentry-built-in', 'me', 'stolar', 3), ('carpentry-built-in', 'me', 'plakari po mjeri', 3), ('carpentry-built-in', 'me', 'kuhinje po mjeri', 3),
  ('carpentry-built-in', 'sr', 'stolar', 3), ('carpentry-built-in', 'sr', 'plakari po meri', 3), ('carpentry-built-in', 'sr', 'kuhinje po meri', 3),
  ('carpentry-built-in', 'en', 'custom cabinetry', 3), ('carpentry-built-in', 'en', 'built-in wardrobe', 3), ('carpentry-built-in', 'en', 'carpenter', 3),
  ('carpentry-built-in', 'tr', 'marangoz', 3), ('carpentry-built-in', 'tr', 'ankastre dolap', 3), ('carpentry-built-in', 'tr', 'mutfak dolabı', 3),
  ('carpentry-built-in', 'de', 'tischlerarbeiten', 3), ('carpentry-built-in', 'de', 'einbauschrank', 3), ('carpentry-built-in', 'de', 'einbauküche', 3),
  ('carpentry-built-in', 'it', 'falegname', 3), ('carpentry-built-in', 'it', 'armadi su misura', 3), ('carpentry-built-in', 'it', 'cucine su misura', 3),
  ('carpentry-built-in', 'ru', 'столяр', 3), ('carpentry-built-in', 'ru', 'встроенные шкафы', 3), ('carpentry-built-in', 'ru', 'кухни на заказ', 3),
  ('carpentry-built-in', 'ar', 'نجار', 3), ('carpentry-built-in', 'ar', 'دواليب مدمجة', 3), ('carpentry-built-in', 'ar', 'مطابخ حسب الطلب', 3),
  ('carpentry-built-in', 'uk', 'столяр', 3), ('carpentry-built-in', 'uk', 'вбудовані шафи', 3), ('carpentry-built-in', 'uk', 'кухні на замовлення', 3),
  -- drywall
  ('drywall', 'me', 'gips kartonske ploče', 3), ('drywall', 'me', 'spušteni plafon', 3), ('drywall', 'me', 'pregrade', 3),
  ('drywall', 'sr', 'gips kartonske ploče', 3), ('drywall', 'sr', 'spušteni plafon', 3), ('drywall', 'sr', 'pregrade', 3),
  ('drywall', 'en', 'plasterboard', 3), ('drywall', 'en', 'suspended ceiling', 3), ('drywall', 'en', 'gypsum board', 3),
  ('drywall', 'tr', 'alçıpan', 3), ('drywall', 'tr', 'asma tavan', 3), ('drywall', 'tr', 'bölme duvar', 3),
  ('drywall', 'de', 'gipskartonplatten', 3), ('drywall', 'de', 'abgehängte decke', 3), ('drywall', 'de', 'trockenbauwand', 3),
  ('drywall', 'it', 'cartongesso', 3), ('drywall', 'it', 'controsoffitto', 3), ('drywall', 'it', 'pareti divisorie', 3),
  ('drywall', 'ru', 'гипсокартон', 3), ('drywall', 'ru', 'подвесной потолок', 3), ('drywall', 'ru', 'перегородки', 3),
  ('drywall', 'ar', 'جبس بورد', 3), ('drywall', 'ar', 'سقف معلق', 3), ('drywall', 'ar', 'جدران فاصلة', 3),
  ('drywall', 'uk', 'гіпсокартон', 3), ('drywall', 'uk', 'підвісна стеля', 3), ('drywall', 'uk', 'перегородки', 3),
  -- flooring
  ('flooring', 'me', 'parket', 3), ('flooring', 'me', 'laminat', 3), ('flooring', 'me', 'podne obloge', 3),
  ('flooring', 'sr', 'parket', 3), ('flooring', 'sr', 'laminat', 3), ('flooring', 'sr', 'podne obloge', 3),
  ('flooring', 'en', 'parquet', 3), ('flooring', 'en', 'laminate flooring', 3), ('flooring', 'en', 'vinyl flooring', 3),
  ('flooring', 'tr', 'parke', 3), ('flooring', 'tr', 'laminat parke', 3), ('flooring', 'tr', 'vinil zemin', 3),
  ('flooring', 'de', 'parkett', 3), ('flooring', 'de', 'laminat', 3), ('flooring', 'de', 'vinylboden', 3),
  ('flooring', 'it', 'parquet', 3), ('flooring', 'it', 'laminato', 3), ('flooring', 'it', 'pavimento vinilico', 3),
  ('flooring', 'ru', 'паркет', 3), ('flooring', 'ru', 'ламинат', 3), ('flooring', 'ru', 'виниловое покрытие', 3),
  ('flooring', 'ar', 'باركيه', 3), ('flooring', 'ar', 'لامينيت', 3), ('flooring', 'ar', 'أرضيات فينيل', 3),
  ('flooring', 'uk', 'паркет', 3), ('flooring', 'uk', 'ламінат', 3), ('flooring', 'uk', 'вінілове покриття', 3),
  -- furniture-assembly
  ('furniture-assembly', 'me', 'montaža namještaja', 3), ('furniture-assembly', 'me', 'sklapanje plakara', 3), ('furniture-assembly', 'me', 'ikea montaža', 3),
  ('furniture-assembly', 'sr', 'montaža nameštaja', 3), ('furniture-assembly', 'sr', 'sklapanje plakara', 3), ('furniture-assembly', 'sr', 'ikea montaža', 3),
  ('furniture-assembly', 'en', 'ikea assembly', 3), ('furniture-assembly', 'en', 'flat-pack assembly', 3), ('furniture-assembly', 'en', 'wardrobe assembly', 3),
  ('furniture-assembly', 'tr', 'mobilya montajı', 3), ('furniture-assembly', 'tr', 'ikea montajı', 3), ('furniture-assembly', 'tr', 'gardırop kurulum', 3),
  ('furniture-assembly', 'de', 'möbelmontage', 3), ('furniture-assembly', 'de', 'ikea aufbau', 3), ('furniture-assembly', 'de', 'schrankaufbau', 3),
  ('furniture-assembly', 'it', 'montaggio mobili', 3), ('furniture-assembly', 'it', 'montaggio ikea', 3), ('furniture-assembly', 'it', 'montaggio armadi', 3),
  ('furniture-assembly', 'ru', 'сборка мебели', 3), ('furniture-assembly', 'ru', 'сборка икеа', 3), ('furniture-assembly', 'ru', 'сборка шкафов', 3),
  ('furniture-assembly', 'ar', 'تركيب أثاث', 3), ('furniture-assembly', 'ar', 'تركيب ايكيا', 3), ('furniture-assembly', 'ar', 'تركيب دواليب', 3),
  ('furniture-assembly', 'uk', 'збирання меблів', 3), ('furniture-assembly', 'uk', 'збирання ikea', 3), ('furniture-assembly', 'uk', 'збирання шаф', 3);


-- ----------------------------------------------------------------------------
-- CATERING-FOOD SUBS (7): wedding-catering, birthday-cake, corporate-catering,
-- home-cooking, turkish-cuisine, boutique-events, ramadan-iftar
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- wedding-catering
  ('wedding-catering', 'me', 'svadbeni ketering', 3), ('wedding-catering', 'me', 'jelo za vjenčanje', 3), ('wedding-catering', 'me', 'meni za svadbu', 3),
  ('wedding-catering', 'sr', 'svadbeni ketering', 3), ('wedding-catering', 'sr', 'jelo za venčanje', 3), ('wedding-catering', 'sr', 'meni za svadbu', 3),
  ('wedding-catering', 'en', 'wedding food', 3), ('wedding-catering', 'en', 'wedding menu', 3), ('wedding-catering', 'en', 'reception catering', 3),
  ('wedding-catering', 'tr', 'düğün catering', 3), ('wedding-catering', 'tr', 'düğün menüsü', 3), ('wedding-catering', 'tr', 'nişan yemeği', 3),
  ('wedding-catering', 'de', 'hochzeitscatering', 3), ('wedding-catering', 'de', 'hochzeitsmenü', 3), ('wedding-catering', 'de', 'hochzeitsbuffet', 3),
  ('wedding-catering', 'it', 'catering matrimonio', 3), ('wedding-catering', 'it', 'menu matrimonio', 3), ('wedding-catering', 'it', 'banchetto nozze', 3),
  ('wedding-catering', 'ru', 'свадебный кейтеринг', 3), ('wedding-catering', 'ru', 'меню для свадьбы', 3), ('wedding-catering', 'ru', 'банкет на свадьбу', 3),
  ('wedding-catering', 'ar', 'مأدبة زفاف', 3), ('wedding-catering', 'ar', 'بوفيه زفاف', 3), ('wedding-catering', 'ar', 'تموين أعراس', 3),
  ('wedding-catering', 'uk', 'весільний кейтеринг', 3), ('wedding-catering', 'uk', 'весільне меню', 3), ('wedding-catering', 'uk', 'банкет на весілля', 3),
  -- birthday-cake
  ('birthday-cake', 'me', 'rođendanska torta', 3), ('birthday-cake', 'me', 'torta po narudžbi', 3), ('birthday-cake', 'me', 'kolači', 3),
  ('birthday-cake', 'sr', 'rođendanska torta', 3), ('birthday-cake', 'sr', 'torta po narudžbi', 3), ('birthday-cake', 'sr', 'kolači', 3),
  ('birthday-cake', 'en', 'custom cake', 3), ('birthday-cake', 'en', 'cake design', 3), ('birthday-cake', 'en', 'celebration cake', 3),
  ('birthday-cake', 'tr', 'doğum günü pastası', 3), ('birthday-cake', 'tr', 'butik pasta', 3), ('birthday-cake', 'tr', 'kişiye özel pasta', 3),
  ('birthday-cake', 'de', 'geburtstagstorte', 3), ('birthday-cake', 'de', 'motivtorte', 3), ('birthday-cake', 'de', 'individuelle torte', 3),
  ('birthday-cake', 'it', 'torta compleanno', 3), ('birthday-cake', 'it', 'cake design', 3), ('birthday-cake', 'it', 'torta personalizzata', 3),
  ('birthday-cake', 'ru', 'торт на день рождения', 3), ('birthday-cake', 'ru', 'торт на заказ', 3), ('birthday-cake', 'ru', 'кейк-дизайн', 3),
  ('birthday-cake', 'ar', 'كيك عيد ميلاد', 3), ('birthday-cake', 'ar', 'كيك حسب الطلب', 3), ('birthday-cake', 'ar', 'كيك تصميم', 3),
  ('birthday-cake', 'uk', 'торт на день народження', 3), ('birthday-cake', 'uk', 'торт на замовлення', 3), ('birthday-cake', 'uk', 'кейк-дизайн', 3),
  -- corporate-catering
  ('corporate-catering', 'me', 'korporativni ketering', 3), ('corporate-catering', 'me', 'poslovni ručak', 3), ('corporate-catering', 'me', 'kancelarijski ketering', 3),
  ('corporate-catering', 'sr', 'korporativni ketering', 3), ('corporate-catering', 'sr', 'poslovni ručak', 3), ('corporate-catering', 'sr', 'kancelarijski ketering', 3),
  ('corporate-catering', 'en', 'office catering', 3), ('corporate-catering', 'en', 'business lunch', 3), ('corporate-catering', 'en', 'corporate event food', 3),
  ('corporate-catering', 'tr', 'kurumsal catering', 3), ('corporate-catering', 'tr', 'ofis yemek', 3), ('corporate-catering', 'tr', 'iş yemeği', 3),
  ('corporate-catering', 'de', 'firmenkundencatering', 3), ('corporate-catering', 'de', 'business lunch', 3), ('corporate-catering', 'de', 'büro catering', 3),
  ('corporate-catering', 'it', 'catering aziendale', 3), ('corporate-catering', 'it', 'pranzo di lavoro', 3), ('corporate-catering', 'it', 'catering ufficio', 3),
  ('corporate-catering', 'ru', 'корпоративный кейтеринг', 3), ('corporate-catering', 'ru', 'бизнес-ланч', 3), ('corporate-catering', 'ru', 'офисный кейтеринг', 3),
  ('corporate-catering', 'ar', 'تموين شركات', 3), ('corporate-catering', 'ar', 'غداء عمل', 3), ('corporate-catering', 'ar', 'تموين مكتبي', 3),
  ('corporate-catering', 'uk', 'корпоративний кейтеринг', 3), ('corporate-catering', 'uk', 'бізнес-ланч', 3), ('corporate-catering', 'uk', 'офісний кейтеринг', 3),
  -- home-cooking
  ('home-cooking', 'me', 'kućna kuhinja', 3), ('home-cooking', 'me', 'domaća jela', 3), ('home-cooking', 'me', 'kuhanje za stari ljudi', 3),
  ('home-cooking', 'sr', 'kućna kuhinja', 3), ('home-cooking', 'sr', 'domaća jela', 3), ('home-cooking', 'sr', 'kuvanje za starije', 3),
  ('home-cooking', 'en', 'home cooked meals', 3), ('home-cooking', 'en', 'meal prep', 3), ('home-cooking', 'en', 'family meals', 3),
  ('home-cooking', 'tr', 'ev yemeği', 3), ('home-cooking', 'tr', 'günlük yemek', 3), ('home-cooking', 'tr', 'aile yemeği', 3),
  ('home-cooking', 'de', 'hausmannskost', 3), ('home-cooking', 'de', 'tagesgerichte', 3), ('home-cooking', 'de', 'meal prep', 3),
  ('home-cooking', 'it', 'cucina casalinga', 3), ('home-cooking', 'it', 'pasti pronti', 3), ('home-cooking', 'it', 'piatti famiglia', 3),
  ('home-cooking', 'ru', 'домашняя кухня', 3), ('home-cooking', 'ru', 'готовая еда', 3), ('home-cooking', 'ru', 'обеды на дом', 3),
  ('home-cooking', 'ar', 'طبخ منزلي', 3), ('home-cooking', 'ar', 'وجبات منزلية', 3), ('home-cooking', 'ar', 'وجبات عائلية', 3),
  ('home-cooking', 'uk', 'домашня кухня', 3), ('home-cooking', 'uk', 'готова їжа', 3), ('home-cooking', 'uk', 'обіди додому', 3),
  -- turkish-cuisine
  ('turkish-cuisine', 'me', 'turska kuhinja', 3), ('turkish-cuisine', 'me', 'kebab', 3), ('turkish-cuisine', 'me', 'baklava', 3),
  ('turkish-cuisine', 'sr', 'turska kuhinja', 3), ('turkish-cuisine', 'sr', 'kebab', 3), ('turkish-cuisine', 'sr', 'baklava', 3),
  ('turkish-cuisine', 'en', 'turkish food', 3), ('turkish-cuisine', 'en', 'kebab', 3), ('turkish-cuisine', 'en', 'baklava', 3),
  ('turkish-cuisine', 'tr', 'türk mutfağı', 3), ('turkish-cuisine', 'tr', 'kebap', 3), ('turkish-cuisine', 'tr', 'baklava', 3),
  ('turkish-cuisine', 'de', 'türkische küche', 3), ('turkish-cuisine', 'de', 'kebab', 3), ('turkish-cuisine', 'de', 'baklava', 3),
  ('turkish-cuisine', 'it', 'cucina turca', 3), ('turkish-cuisine', 'it', 'kebab', 3), ('turkish-cuisine', 'it', 'baklava', 3),
  ('turkish-cuisine', 'ru', 'турецкая кухня', 3), ('turkish-cuisine', 'ru', 'кебаб', 3), ('turkish-cuisine', 'ru', 'пахлава', 3),
  ('turkish-cuisine', 'ar', 'مطبخ تركي', 3), ('turkish-cuisine', 'ar', 'كباب', 3), ('turkish-cuisine', 'ar', 'بقلاوة', 3),
  ('turkish-cuisine', 'uk', 'турецька кухня', 3), ('turkish-cuisine', 'uk', 'кебаб', 3), ('turkish-cuisine', 'uk', 'пахлава', 3),
  -- boutique-events
  ('boutique-events', 'me', 'butik događaji', 3), ('boutique-events', 'me', 'privatna proslava', 3), ('boutique-events', 'me', 'mali skup', 3),
  ('boutique-events', 'sr', 'butik događaji', 3), ('boutique-events', 'sr', 'privatna proslava', 3), ('boutique-events', 'sr', 'mali skup', 3),
  ('boutique-events', 'en', 'private dining', 3), ('boutique-events', 'en', 'intimate event', 3), ('boutique-events', 'en', 'boutique catering', 3),
  ('boutique-events', 'tr', 'butik organizasyon', 3), ('boutique-events', 'tr', 'özel davet', 3), ('boutique-events', 'tr', 'küçük organizasyon', 3),
  ('boutique-events', 'de', 'private veranstaltung', 3), ('boutique-events', 'de', 'intime feier', 3), ('boutique-events', 'de', 'boutique-catering', 3),
  ('boutique-events', 'it', 'eventi privati', 3), ('boutique-events', 'it', 'cena privata', 3), ('boutique-events', 'it', 'catering esclusivo', 3),
  ('boutique-events', 'ru', 'частное мероприятие', 3), ('boutique-events', 'ru', 'камерное событие', 3), ('boutique-events', 'ru', 'бутик-кейтеринг', 3),
  ('boutique-events', 'ar', 'حفلات خاصة', 3), ('boutique-events', 'ar', 'حفلة حصرية', 3), ('boutique-events', 'ar', 'تموين خاص', 3),
  ('boutique-events', 'uk', 'приватний захід', 3), ('boutique-events', 'uk', 'камерна подія', 3), ('boutique-events', 'uk', 'бутік-кейтеринг', 3),
  -- ramadan-iftar
  ('ramadan-iftar', 'me', 'ramazanski iftar', 3), ('ramadan-iftar', 'me', 'iftar meni', 3), ('ramadan-iftar', 'me', 'ramazan jelo', 3),
  ('ramadan-iftar', 'sr', 'ramazanski iftar', 3), ('ramadan-iftar', 'sr', 'iftar meni', 3), ('ramadan-iftar', 'sr', 'ramazan jelo', 3),
  ('ramadan-iftar', 'en', 'iftar menu', 3), ('ramadan-iftar', 'en', 'ramadan catering', 3), ('ramadan-iftar', 'en', 'iftar buffet', 3),
  ('ramadan-iftar', 'tr', 'iftar menüsü', 3), ('ramadan-iftar', 'tr', 'ramazan catering', 3), ('ramadan-iftar', 'tr', 'iftar açık büfe', 3),
  ('ramadan-iftar', 'de', 'iftar menü', 3), ('ramadan-iftar', 'de', 'ramadan catering', 3), ('ramadan-iftar', 'de', 'iftar buffet', 3),
  ('ramadan-iftar', 'it', 'menu iftar', 3), ('ramadan-iftar', 'it', 'catering ramadan', 3), ('ramadan-iftar', 'it', 'buffet iftar', 3),
  ('ramadan-iftar', 'ru', 'ифтар меню', 3), ('ramadan-iftar', 'ru', 'кейтеринг рамадан', 3), ('ramadan-iftar', 'ru', 'ифтар буфет', 3),
  ('ramadan-iftar', 'ar', 'إفطار رمضان', 3), ('ramadan-iftar', 'ar', 'وجبات إفطار', 3), ('ramadan-iftar', 'ar', 'تموين رمضان', 3),
  ('ramadan-iftar', 'uk', 'іфтар меню', 3), ('ramadan-iftar', 'uk', 'кейтеринг рамадан', 3), ('ramadan-iftar', 'uk', 'іфтар буфет', 3);


-- ----------------------------------------------------------------------------
-- TUTORING-EDUCATION SUBS (7): language-lessons, music-lessons, math-tutoring,
-- university-prep, online-lessons, child-development, art-lessons
-- ----------------------------------------------------------------------------

INSERT INTO public.glatko_search_synonyms (canonical_slug, locale, synonym, weight) VALUES
  -- language-lessons
  ('language-lessons', 'me', 'kursevi jezika', 3), ('language-lessons', 'me', 'engleski jezik časovi', 3), ('language-lessons', 'me', 'crnogorski jezik', 3),
  ('language-lessons', 'sr', 'kursevi jezika', 3), ('language-lessons', 'sr', 'engleski jezik časovi', 3), ('language-lessons', 'sr', 'srpski za strance', 3),
  ('language-lessons', 'en', 'esl', 3), ('language-lessons', 'en', 'language tutor', 3), ('language-lessons', 'en', 'foreign language', 3),
  ('language-lessons', 'tr', 'dil kursu', 3), ('language-lessons', 'tr', 'ingilizce kursu', 3), ('language-lessons', 'tr', 'türkçe dersi yabancılar', 3),
  ('language-lessons', 'de', 'sprachkurs', 3), ('language-lessons', 'de', 'englischkurs', 3), ('language-lessons', 'de', 'deutsch als fremdsprache', 3),
  ('language-lessons', 'it', 'corso di lingua', 3), ('language-lessons', 'it', 'lezioni inglese', 3), ('language-lessons', 'it', 'italiano per stranieri', 3),
  ('language-lessons', 'ru', 'курсы иностранных языков', 3), ('language-lessons', 'ru', 'английский с нуля', 3), ('language-lessons', 'ru', 'русский для иностранцев', 3),
  ('language-lessons', 'ar', 'دورات لغات', 3), ('language-lessons', 'ar', 'دروس انجليزي', 3), ('language-lessons', 'ar', 'عربي للأجانب', 3),
  ('language-lessons', 'uk', 'курси мов', 3), ('language-lessons', 'uk', 'англійська з нуля', 3), ('language-lessons', 'uk', 'українська для іноземців', 3),
  -- music-lessons
  ('music-lessons', 'me', 'časovi gitare', 3), ('music-lessons', 'me', 'časovi violine', 3), ('music-lessons', 'me', 'pjevanje časovi', 3),
  ('music-lessons', 'sr', 'časovi gitare', 3), ('music-lessons', 'sr', 'časovi violine', 3), ('music-lessons', 'sr', 'pevanje časovi', 3),
  ('music-lessons', 'en', 'guitar lessons', 3), ('music-lessons', 'en', 'violin lessons', 3), ('music-lessons', 'en', 'singing lessons', 3),
  ('music-lessons', 'tr', 'gitar dersi', 3), ('music-lessons', 'tr', 'keman dersi', 3), ('music-lessons', 'tr', 'şan dersi', 3),
  ('music-lessons', 'de', 'gitarrenunterricht', 3), ('music-lessons', 'de', 'violinunterricht', 3), ('music-lessons', 'de', 'gesangsunterricht', 3),
  ('music-lessons', 'it', 'lezioni di chitarra', 3), ('music-lessons', 'it', 'lezioni di violino', 3), ('music-lessons', 'it', 'lezioni di canto', 3),
  ('music-lessons', 'ru', 'уроки гитары', 3), ('music-lessons', 'ru', 'уроки скрипки', 3), ('music-lessons', 'ru', 'уроки вокала', 3),
  ('music-lessons', 'ar', 'دروس جيتار', 3), ('music-lessons', 'ar', 'دروس كمان', 3), ('music-lessons', 'ar', 'دروس غناء', 3),
  ('music-lessons', 'uk', 'уроки гітари', 3), ('music-lessons', 'uk', 'уроки скрипки', 3), ('music-lessons', 'uk', 'уроки вокалу', 3),
  -- math-tutoring
  ('math-tutoring', 'me', 'instrukcije matematika', 3), ('math-tutoring', 'me', 'matematika osnovna', 3), ('math-tutoring', 'me', 'matematika srednja', 3),
  ('math-tutoring', 'sr', 'instrukcije matematika', 3), ('math-tutoring', 'sr', 'matematika osnovna', 3), ('math-tutoring', 'sr', 'matematika srednja', 3),
  ('math-tutoring', 'en', 'algebra tutor', 3), ('math-tutoring', 'en', 'calculus tutor', 3), ('math-tutoring', 'en', 'geometry help', 3),
  ('math-tutoring', 'tr', 'matematik kursu', 3), ('math-tutoring', 'tr', 'cebir', 3), ('math-tutoring', 'tr', 'geometri', 3),
  ('math-tutoring', 'de', 'mathenachhilfe', 3), ('math-tutoring', 'de', 'algebra unterricht', 3), ('math-tutoring', 'de', 'geometrie nachhilfe', 3),
  ('math-tutoring', 'it', 'ripetizioni matematica', 3), ('math-tutoring', 'it', 'algebra ripetizioni', 3), ('math-tutoring', 'it', 'geometria aiuto', 3),
  ('math-tutoring', 'ru', 'репетитор по математике', 3), ('math-tutoring', 'ru', 'алгебра', 3), ('math-tutoring', 'ru', 'геометрия', 3),
  ('math-tutoring', 'ar', 'مدرس رياضيات', 3), ('math-tutoring', 'ar', 'جبر', 3), ('math-tutoring', 'ar', 'هندسة', 3),
  ('math-tutoring', 'uk', 'репетитор з математики', 3), ('math-tutoring', 'uk', 'алгебра', 3), ('math-tutoring', 'uk', 'геометрія', 3),
  -- university-prep
  ('university-prep', 'me', 'priprema za maturu', 3), ('university-prep', 'me', 'priprema za fakultet', 3), ('university-prep', 'me', 'sat priprema', 3),
  ('university-prep', 'sr', 'priprema za maturu', 3), ('university-prep', 'sr', 'priprema za fakultet', 3), ('university-prep', 'sr', 'sat priprema', 3),
  ('university-prep', 'en', 'sat prep', 3), ('university-prep', 'en', 'ielts prep', 3), ('university-prep', 'en', 'university entrance prep', 3),
  ('university-prep', 'tr', 'yks hazırlık', 3), ('university-prep', 'tr', 'tyt hazırlık', 3), ('university-prep', 'tr', 'ielts hazırlık', 3),
  ('university-prep', 'de', 'abitur vorbereitung', 3), ('university-prep', 'de', 'studienkolleg', 3), ('university-prep', 'de', 'universitätsvorbereitung', 3),
  ('university-prep', 'it', 'preparazione maturità', 3), ('university-prep', 'it', 'test ammissione università', 3), ('university-prep', 'it', 'preparazione esami', 3),
  ('university-prep', 'ru', 'подготовка к егэ', 3), ('university-prep', 'ru', 'подготовка к sat', 3), ('university-prep', 'ru', 'подготовка к ielts', 3),
  ('university-prep', 'ar', 'تحضير للجامعة', 3), ('university-prep', 'ar', 'تحضير ielts', 3), ('university-prep', 'ar', 'تحضير sat', 3),
  ('university-prep', 'uk', 'підготовка до зно', 3), ('university-prep', 'uk', 'підготовка до sat', 3), ('university-prep', 'uk', 'підготовка до ielts', 3),
  -- online-lessons
  ('online-lessons', 'me', 'online časovi', 3), ('online-lessons', 'me', 'zoom časovi', 3), ('online-lessons', 'me', 'skype časovi', 3),
  ('online-lessons', 'sr', 'online časovi', 3), ('online-lessons', 'sr', 'zoom časovi', 3), ('online-lessons', 'sr', 'skype časovi', 3),
  ('online-lessons', 'en', 'online tutor', 3), ('online-lessons', 'en', 'zoom lessons', 3), ('online-lessons', 'en', 'remote tutoring', 3),
  ('online-lessons', 'tr', 'online ders', 3), ('online-lessons', 'tr', 'uzaktan ders', 3), ('online-lessons', 'tr', 'zoom ders', 3),
  ('online-lessons', 'de', 'online unterricht', 3), ('online-lessons', 'de', 'zoom unterricht', 3), ('online-lessons', 'de', 'fernunterricht', 3),
  ('online-lessons', 'it', 'lezioni online', 3), ('online-lessons', 'it', 'tutoring a distanza', 3), ('online-lessons', 'it', 'lezioni zoom', 3),
  ('online-lessons', 'ru', 'онлайн уроки', 3), ('online-lessons', 'ru', 'занятия по zoom', 3), ('online-lessons', 'ru', 'дистанционное обучение', 3),
  ('online-lessons', 'ar', 'دروس اونلاين', 3), ('online-lessons', 'ar', 'دروس عن بعد', 3), ('online-lessons', 'ar', 'دروس زوم', 3),
  ('online-lessons', 'uk', 'онлайн уроки', 3), ('online-lessons', 'uk', 'заняття zoom', 3), ('online-lessons', 'uk', 'дистанційне навчання', 3),
  -- child-development
  ('child-development', 'me', 'razvoj djece', 3), ('child-development', 'me', 'predškolski program', 3), ('child-development', 'me', 'rana edukacija', 3),
  ('child-development', 'sr', 'razvoj dece', 3), ('child-development', 'sr', 'predškolski program', 3), ('child-development', 'sr', 'rana edukacija', 3),
  ('child-development', 'en', 'early childhood education', 3), ('child-development', 'en', 'preschool prep', 3), ('child-development', 'en', 'cognitive development', 3),
  ('child-development', 'tr', 'çocuk gelişimi', 3), ('child-development', 'tr', 'okul öncesi eğitim', 3), ('child-development', 'tr', 'erken çocukluk', 3),
  ('child-development', 'de', 'kindesentwicklung', 3), ('child-development', 'de', 'vorschulbildung', 3), ('child-development', 'de', 'frühförderung', 3),
  ('child-development', 'it', 'sviluppo bambino', 3), ('child-development', 'it', 'pre-scolare', 3), ('child-development', 'it', 'educazione infantile', 3),
  ('child-development', 'ru', 'развитие ребёнка', 3), ('child-development', 'ru', 'дошкольная подготовка', 3), ('child-development', 'ru', 'раннее развитие', 3),
  ('child-development', 'ar', 'تنمية الطفل', 3), ('child-development', 'ar', 'تحضير ما قبل المدرسة', 3), ('child-development', 'ar', 'تعليم الطفولة المبكرة', 3),
  ('child-development', 'uk', 'розвиток дитини', 3), ('child-development', 'uk', 'дошкільна підготовка', 3), ('child-development', 'uk', 'ранній розвиток', 3),
  -- art-lessons
  ('art-lessons', 'me', 'časovi crtanja', 3), ('art-lessons', 'me', 'časovi slikanja', 3), ('art-lessons', 'me', 'likovne radionice', 3),
  ('art-lessons', 'sr', 'časovi crtanja', 3), ('art-lessons', 'sr', 'časovi slikanja', 3), ('art-lessons', 'sr', 'likovne radionice', 3),
  ('art-lessons', 'en', 'drawing lessons', 3), ('art-lessons', 'en', 'painting lessons', 3), ('art-lessons', 'en', 'art workshop', 3),
  ('art-lessons', 'tr', 'resim dersi', 3), ('art-lessons', 'tr', 'çizim dersi', 3), ('art-lessons', 'tr', 'sanat atölyesi', 3),
  ('art-lessons', 'de', 'zeichenunterricht', 3), ('art-lessons', 'de', 'malunterricht', 3), ('art-lessons', 'de', 'kunstworkshop', 3),
  ('art-lessons', 'it', 'lezioni di disegno', 3), ('art-lessons', 'it', 'lezioni di pittura', 3), ('art-lessons', 'it', 'laboratorio artistico', 3),
  ('art-lessons', 'ru', 'уроки рисования', 3), ('art-lessons', 'ru', 'уроки живописи', 3), ('art-lessons', 'ru', 'арт мастерская', 3),
  ('art-lessons', 'ar', 'دروس رسم', 3), ('art-lessons', 'ar', 'دروس تلوين', 3), ('art-lessons', 'ar', 'ورشة فنية', 3),
  ('art-lessons', 'uk', 'уроки малювання', 3), ('art-lessons', 'uk', 'уроки живопису', 3), ('art-lessons', 'uk', 'арт майстерня', 3);

COMMIT;
