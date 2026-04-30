-- ============================================================================
-- 010_glatko_categories_expansion.sql
-- G-CAT-1: 10 P0 root categories + 75 subs + metadata enrichment
--
-- Sections:
--   1. Schema additions: hero_image_url, seasonal, active_months,
--      badge_priority, is_p0, translation_status + p0/priority partial index
--   2. Storage bucket: category-images (public read)
--   3. Icon migration: 21 existing icons snake_case -> PascalCase (lucide)
--   4. Slug renames: 6 existing slugs (id preserved, all FKs intact)
--   5. Seed 10 P0 roots (UPSERT: 2 update, 8 insert)
--   6. Seed 75 P0 subs (UPSERT: 8 update in-place, 67 insert)
--   7. Soft-delete 6 existing subs not in master
--   8. Soft-delete home-services root, guarded by active-sub count
--   9. Verification queries (P0 counts, structural checks)
--
-- Translation status: me/sr/en/tr = verified, de/it/ru/ar/uk = auto
-- Hero images: placehold.co placeholders, real assets come in G-CAT-2
-- All seed rows: is_p0 = TRUE
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Schema additions
-- ----------------------------------------------------------------------------

ALTER TABLE glatko_service_categories
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS seasonal TEXT
    CHECK (seasonal IS NULL OR seasonal IN ('year-round','summer','summer-peak','winter')),
  ADD COLUMN IF NOT EXISTS active_months INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  ADD COLUMN IF NOT EXISTS badge_priority INTEGER DEFAULT 99,
  ADD COLUMN IF NOT EXISTS is_p0 BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_glatko_categories_p0_priority
  ON glatko_service_categories(is_p0, badge_priority) WHERE is_p0 = TRUE;

-- ----------------------------------------------------------------------------
-- 2. Storage bucket for category hero images
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Anyone can read category-images'
  ) THEN
    CREATE POLICY "Anyone can read category-images" ON storage.objects
      FOR SELECT USING (bucket_id = 'category-images');
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Migrate existing 21-row icons snake_case -> PascalCase (lucide naming)
-- ----------------------------------------------------------------------------

UPDATE glatko_service_categories SET icon = 'Home'           WHERE icon = 'home';
UPDATE glatko_service_categories SET icon = 'Anchor'         WHERE icon = 'anchor';
UPDATE glatko_service_categories SET icon = 'Sparkles'       WHERE icon = 'sparkles';
UPDATE glatko_service_categories SET icon = 'Hammer'         WHERE icon = 'hammer';
UPDATE glatko_service_categories SET icon = 'Paintbrush'     WHERE icon = 'paintbrush';
UPDATE glatko_service_categories SET icon = 'Zap'            WHERE icon = 'zap';
UPDATE glatko_service_categories SET icon = 'Droplets'       WHERE icon = 'droplets';
UPDATE glatko_service_categories SET icon = 'Thermometer'    WHERE icon = 'thermometer';
UPDATE glatko_service_categories SET icon = 'Sofa'           WHERE icon = 'sofa';
UPDATE glatko_service_categories SET icon = 'Trees'          WHERE icon = 'trees';
UPDATE glatko_service_categories SET icon = 'Waves'          WHERE icon = 'waves';
UPDATE glatko_service_categories SET icon = 'User'           WHERE icon = 'user';
UPDATE glatko_service_categories SET icon = 'Shield'         WHERE icon = 'shield';
UPDATE glatko_service_categories SET icon = 'Settings'       WHERE icon = 'settings';
UPDATE glatko_service_categories SET icon = 'Brush'          WHERE icon = 'brush';
UPDATE glatko_service_categories SET icon = 'Snowflake'      WHERE icon = 'snowflake';
UPDATE glatko_service_categories SET icon = 'Clipboard'      WHERE icon = 'clipboard';
UPDATE glatko_service_categories SET icon = 'AlertTriangle'  WHERE icon = 'alert-triangle';
UPDATE glatko_service_categories SET icon = 'Truck'          WHERE icon = 'truck';

-- ----------------------------------------------------------------------------
-- 4. Slug renames (existing rows; preserves id, all FKs intact)
-- ----------------------------------------------------------------------------

UPDATE glatko_service_categories SET slug = 'boat-engine-service' WHERE slug = 'engine-service';
UPDATE glatko_service_categories SET slug = 'captain-daily'       WHERE slug = 'captain-hire';
UPDATE glatko_service_categories SET slug = 'winter-storage'      WHERE slug = 'winterization';
UPDATE glatko_service_categories SET slug = 'charter-cleaning'    WHERE slug = 'charter-prep';
UPDATE glatko_service_categories SET slug = 'regular-cleaning'    WHERE slug = 'general-cleaning';
UPDATE glatko_service_categories SET slug = 'villa-cleaning'      WHERE slug = 'villa-airbnb';

-- ----------------------------------------------------------------------------
-- 5. Seed 10 P0 root categories (UPSERT)
-- ----------------------------------------------------------------------------

INSERT INTO glatko_service_categories
  (slug, parent_id, name, description, icon, sort_order,
   hero_image_url, seasonal, active_months, badge_priority, is_p0, translation_status, is_active)
VALUES
  ('boat-services', NULL,
    '{"me":"Usluge za plovila","sr":"Услуге за пловила","en":"Boat Services","tr":"Tekne Hizmetleri","de":"Bootsdienste","it":"Servizi nautici","ru":"Услуги для лодок","ar":"خدمات القوارب","uk":"Послуги для човнів"}'::jsonb,
    NULL, 'Anchor', 1,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Boat+Services',
    'summer', ARRAY[5,6,7,8,9,10], 1, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('home-cleaning', NULL,
    '{"me":"Čišćenje kuća","sr":"Чишћење кућа","en":"Home Cleaning","tr":"Ev Temizlik","de":"Haushaltsreinigung","it":"Pulizia casa","ru":"Уборка дома","ar":"تنظيف المنازل","uk":"Прибирання дому"}'::jsonb,
    NULL, 'Sparkles', 2,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Home+Cleaning',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 2, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('renovation-construction', NULL,
    '{"me":"Renoviranje i gradnja","sr":"Реновирање и градња","en":"Renovation & Construction","tr":"Tadilat & İnşaat","de":"Renovierung & Bau","it":"Ristrutturazione","ru":"Ремонт и стройка","ar":"تجديد وبناء","uk":"Ремонт і будівництво"}'::jsonb,
    NULL, 'Hammer', 3,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Renovation',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 3, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('beauty-wellness', NULL,
    '{"me":"Lepota i nega","sr":"Лепота и нега","en":"Beauty & Wellness","tr":"Güzellik & Bakım","de":"Beauty & Wellness","it":"Bellezza e benessere","ru":"Красота и уход","ar":"جمال وعناية","uk":"Краса і догляд"}'::jsonb,
    NULL, 'Scissors', 4,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Beauty',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 4, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('catering-food', NULL,
    '{"me":"Catering i hrana","sr":"Кетеринг и храна","en":"Catering & Food","tr":"Yemek & Catering","de":"Catering & Essen","it":"Catering e cibo","ru":"Кейтеринг и еда","ar":"تموين وطعام","uk":"Кейтеринг і їжа"}'::jsonb,
    NULL, 'ChefHat', 5,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Catering',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 5, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('tutoring-education', NULL,
    '{"me":"Privatne instrukcije","sr":"Приватне инструкције","en":"Tutoring & Education","tr":"Eğitim & Ders","de":"Nachhilfe & Bildung","it":"Lezioni private","ru":"Репетиторство","ar":"دروس خصوصية","uk":"Репетиторство"}'::jsonb,
    NULL, 'GraduationCap', 6,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Education',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 6, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('childcare-family', NULL,
    '{"me":"Briga o djeci","sr":"Брига о деци","en":"Childcare & Family","tr":"Çocuk & Aile","de":"Kinderbetreuung","it":"Bambini e famiglia","ru":"Дети и семья","ar":"رعاية الأطفال","uk":"Догляд за дітьми"}'::jsonb,
    NULL, 'Baby', 7,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Childcare',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 7, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('moving-transport', NULL,
    '{"me":"Selidbe i transport","sr":"Селидбе и транспорт","en":"Moving & Transport","tr":"Nakliye & Transport","de":"Umzug & Transport","it":"Trasloco e trasporto","ru":"Переезд и транспорт","ar":"نقل وانتقال","uk":"Переїзд і транспорт"}'::jsonb,
    NULL, 'Truck', 8,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Moving',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 8, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('automotive', NULL,
    '{"me":"Auto servis","sr":"Ауто сервис","en":"Automotive","tr":"Otomotiv","de":"Kfz-Service","it":"Servizi auto","ru":"Автосервис","ar":"خدمات السيارات","uk":"Автосервіс"}'::jsonb,
    NULL, 'Car', 9,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Automotive',
    'year-round', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 9, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE),
  ('airbnb-management', NULL,
    '{"me":"Airbnb upravljanje","sr":"Airbnb управљање","en":"Airbnb Management","tr":"Airbnb İşletme","de":"Airbnb-Verwaltung","it":"Gestione Airbnb","ru":"Управление Airbnb","ar":"إدارة Airbnb","uk":"Управління Airbnb"}'::jsonb,
    NULL, 'Home', 10,
    'https://placehold.co/1920x1080/6366F1/ffffff?text=Airbnb+Management',
    'summer-peak', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], 10, TRUE,
    '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb,
    TRUE)
ON CONFLICT (slug) DO UPDATE SET
  parent_id          = EXCLUDED.parent_id,
  name               = EXCLUDED.name,
  icon               = EXCLUDED.icon,
  sort_order         = EXCLUDED.sort_order,
  hero_image_url     = EXCLUDED.hero_image_url,
  seasonal           = EXCLUDED.seasonal,
  active_months      = EXCLUDED.active_months,
  badge_priority     = EXCLUDED.badge_priority,
  is_p0              = EXCLUDED.is_p0,
  translation_status = EXCLUDED.translation_status,
  is_active          = TRUE;

-- ----------------------------------------------------------------------------
-- 6. Seed 75 P0 sub categories (UPSERT)
--    Uses parent_lookup CTE to resolve parent_id by slug
--    Existing 8 subs UPDATE in-place via ON CONFLICT (parent_id moves too)
-- ----------------------------------------------------------------------------

WITH parent_lookup AS (
  SELECT slug, id FROM glatko_service_categories
  WHERE slug IN (
    'boat-services','home-cleaning','renovation-construction','beauty-wellness',
    'catering-food','tutoring-education','childcare-family','moving-transport',
    'automotive','airbnb-management'
  )
),
verified_status AS (
  SELECT '{"me":"verified","sr":"verified","en":"verified","tr":"verified","de":"auto","it":"auto","ru":"auto","ar":"auto","uk":"auto"}'::jsonb AS s
),
sub_data(slug, parent_slug, name, icon, sort_order) AS (
  VALUES
    -- ===== boat-services subs (8) =====
    ('hull-cleaning', 'boat-services',
      '{"me":"Pranje korita","sr":"Прање корита","en":"Hull Cleaning","tr":"Tekne Dibi Temizliği","de":"Rumpfreinigung","it":"Pulizia scafo","ru":"Мойка корпуса","ar":"تنظيف البدن","uk":"Миття корпусу"}'::jsonb,
      'Brush', 1),
    ('antifouling', 'boat-services',
      '{"me":"Antifouling","sr":"Антифоулинг","en":"Antifouling","tr":"Zehirli Boya (Antifouling)","de":"Antifouling","it":"Antivegetativa","ru":"Антифоулинг","ar":"طلاء واقٍ","uk":"Антифоулінг"}'::jsonb,
      'Shield', 2),
    ('boat-engine-service', 'boat-services',
      '{"me":"Servis motora plovila","sr":"Сервис мотора пловила","en":"Engine Service","tr":"Tekne Motor Servisi","de":"Motorservice","it":"Servizio motore","ru":"Сервис мотора","ar":"صيانة المحرك","uk":"Сервіс мотора"}'::jsonb,
      'Settings', 3),
    ('captain-daily', 'boat-services',
      '{"me":"Dnevni kapetan","sr":"Дневни капетан","en":"Daily Captain","tr":"Günlük Kaptan","de":"Tageskapitän","it":"Capitano giornaliero","ru":"Капитан на день","ar":"قبطان يومي","uk":"Капітан на день"}'::jsonb,
      'Compass', 4),
    ('winter-storage', 'boat-services',
      '{"me":"Zimovanje","sr":"Зимовање","en":"Winter Storage","tr":"Kışlama Hizmeti","de":"Winterlager","it":"Rimessaggio","ru":"Зимовка","ar":"تخزين شتوي","uk":"Зимове зберігання"}'::jsonb,
      'Snowflake', 5),
    ('charter-cleaning', 'boat-services',
      '{"me":"Čišćenje čartera","sr":"Чишћење чартера","en":"Charter Cleaning","tr":"Charter Teslim Temizliği","de":"Charter-Reinigung","it":"Pulizia charter","ru":"Уборка чартера","ar":"تنظيف الإيجار","uk":"Чартер прибирання"}'::jsonb,
      'Sparkles', 6),
    ('electrical-electronics', 'boat-services',
      '{"me":"Elektrika i elektronika plovila","sr":"Електрика и електроника пловила","en":"Electronics","tr":"Elektronik","de":"Elektronik","it":"Elettronica","ru":"Электроника","ar":"إلكترونيات","uk":"Електроніка"}'::jsonb,
      'CircuitBoard', 7),
    ('sail-canvas', 'boat-services',
      '{"me":"Jedra i platno","sr":"Једра и платно","en":"Sails & Canvas","tr":"Yelken Branda","de":"Segel & Tuch","it":"Vele e tendalini","ru":"Паруса и тенты","ar":"أشرعة وأقمشة","uk":"Вітрила і тенти"}'::jsonb,
      'Wind', 8),

    -- ===== home-cleaning subs (7) =====
    ('regular-cleaning', 'home-cleaning',
      '{"me":"Redovno čišćenje","sr":"Редовно чишћење","en":"Regular Cleaning","tr":"Düzenli Temizlik","de":"Reguläre Reinigung","it":"Pulizia regolare","ru":"Регулярная уборка","ar":"تنظيف منتظم","uk":"Регулярне прибирання"}'::jsonb,
      'Sparkles', 1),
    ('deep-cleaning', 'home-cleaning',
      '{"me":"Dubinsko čišćenje","sr":"Дубинско чишћење","en":"Deep Cleaning","tr":"Derin Temizlik","de":"Grundreinigung","it":"Pulizia profonda","ru":"Глубокая уборка","ar":"تنظيف عميق","uk":"Глибоке прибирання"}'::jsonb,
      'SprayCan', 2),
    ('airbnb-turnover', 'home-cleaning',
      '{"me":"Smjena gostiju Airbnb","sr":"Смена гостију Airbnb","en":"Airbnb Turnover","tr":"Airbnb Misafir Değişim Temizliği","de":"Airbnb Wechsel","it":"Cambio Airbnb","ru":"Уборка Airbnb","ar":"تنظيف بين الضيوف","uk":"Прибирання Airbnb"}'::jsonb,
      'RotateCw', 3),
    ('carpet-washing', 'home-cleaning',
      '{"me":"Pranje tepiha","sr":"Прање тепиха","en":"Carpet Washing","tr":"Halı Yıkama","de":"Teppichreinigung","it":"Lavaggio tappeti","ru":"Стирка ковров","ar":"غسيل السجاد","uk":"Чищення килимів"}'::jsonb,
      'Brush', 4),
    ('window-cleaning', 'home-cleaning',
      '{"me":"Pranje prozora","sr":"Прање прозора","en":"Window Cleaning","tr":"Cam Temizliği","de":"Fensterputzen","it":"Pulizia vetri","ru":"Мытьё окон","ar":"تنظيف النوافذ","uk":"Миття вікон"}'::jsonb,
      'Sun', 5),
    ('post-construction', 'home-cleaning',
      '{"me":"Posle gradnje","sr":"После градње","en":"Post-Construction","tr":"İnşaat Sonrası Temizlik","de":"Bauendreinigung","it":"Pulizia post-cantiere","ru":"После ремонта","ar":"تنظيف بعد البناء","uk":"Прибирання після ремонту"}'::jsonb,
      'Hammer', 6),
    ('villa-cleaning', 'home-cleaning',
      '{"me":"Čišćenje vile","sr":"Чишћење виле","en":"Villa Cleaning","tr":"Villa Temizliği","de":"Villa-Reinigung","it":"Pulizia villa","ru":"Уборка виллы","ar":"تنظيف الفيلا","uk":"Прибирання вілли"}'::jsonb,
      'Building2', 7),

    -- ===== renovation-construction subs (8) =====
    ('painting', 'renovation-construction',
      '{"me":"Bojenje","sr":"Бојење","en":"Painting","tr":"Boya-Badana","de":"Malerarbeiten","it":"Pittura","ru":"Покраска","ar":"دهان","uk":"Малярка"}'::jsonb,
      'Paintbrush', 1),
    ('electrical', 'renovation-construction',
      '{"me":"Elektrika","sr":"Електрика","en":"Electrical","tr":"Elektrik","de":"Elektroinstallation","it":"Impianti elettrici","ru":"Электрика","ar":"كهرباء","uk":"Електрика"}'::jsonb,
      'Zap', 2),
    ('plumbing', 'renovation-construction',
      '{"me":"Vodoinstalacija","sr":"Водоинсталација","en":"Plumbing","tr":"Su Tesisatı","de":"Sanitärinstallation","it":"Idraulica","ru":"Сантехника","ar":"سباكة","uk":"Сантехніка"}'::jsonb,
      'Wrench', 3),
    ('tiling', 'renovation-construction',
      '{"me":"Pločice","sr":"Плочице","en":"Tiling","tr":"Fayans","de":"Fliesenarbeiten","it":"Piastrellista","ru":"Плитка","ar":"بلاط","uk":"Плитка"}'::jsonb,
      'Grid3x3', 4),
    ('carpentry-built-in', 'renovation-construction',
      '{"me":"Stolarija","sr":"Столарија","en":"Carpentry","tr":"Marangoz","de":"Schreinerei","it":"Falegnameria","ru":"Столярка","ar":"نجارة","uk":"Столярка"}'::jsonb,
      'Hammer', 5),
    ('drywall', 'renovation-construction',
      '{"me":"Gipskarton","sr":"Гипскартон","en":"Drywall","tr":"Alçıpan","de":"Trockenbau","it":"Cartongesso","ru":"Гипсокартон","ar":"حوائط جبسية","uk":"Гіпсокартон"}'::jsonb,
      'Square', 6),
    ('flooring', 'renovation-construction',
      '{"me":"Podovi","sr":"Подови","en":"Flooring","tr":"Zemin Kaplama","de":"Bodenbeläge","it":"Pavimenti","ru":"Напольные покрытия","ar":"تركيب أرضيات","uk":"Підлоги"}'::jsonb,
      'Layers', 7),
    ('furniture-assembly', 'renovation-construction',
      '{"me":"Montaža namještaja","sr":"Монтажа намештаја","en":"Furniture Assembly","tr":"Mobilya Montajı","de":"Möbelmontage","it":"Montaggio mobili","ru":"Сборка мебели","ar":"تركيب الأثاث","uk":"Збірка меблів"}'::jsonb,
      'Sofa', 8),

    -- ===== beauty-wellness subs (9) =====
    ('hair-salon', 'beauty-wellness',
      '{"me":"Frizerski salon","sr":"Фризерски салон","en":"Hair Salon","tr":"Kuaför","de":"Friseur","it":"Parrucchiere","ru":"Парикмахерская","ar":"صالون شعر","uk":"Перукарня"}'::jsonb,
      'Scissors', 1),
    ('manicure-pedicure', 'beauty-wellness',
      '{"me":"Manikir-pedikir","sr":"Маникир-педикир","en":"Manicure-Pedicure","tr":"Manikür & Pedikür","de":"Maniküre-Pediküre","it":"Manicure-Pedicure","ru":"Маникюр-педикюр","ar":"مانيكير-باديكير","uk":"Манікюр-педикюр"}'::jsonb,
      'Sparkles', 2),
    ('permanent-makeup', 'beauty-wellness',
      '{"me":"Permanentni makeup","sr":"Перманентни мејкап","en":"Permanent Makeup","tr":"Kalıcı Makyaj","de":"Permanent Make-up","it":"Trucco semipermanente","ru":"Перманентный макияж","ar":"ميك أب دائم","uk":"Перманентний макіяж"}'::jsonb,
      'Pen', 3),
    ('facial-skincare', 'beauty-wellness',
      '{"me":"Nega lica","sr":"Нега лица","en":"Facial & Skincare","tr":"Cilt Bakımı","de":"Gesichtspflege","it":"Cura del viso","ru":"Уход за лицом","ar":"عناية بالبشرة","uk":"Догляд за обличчям"}'::jsonb,
      'Smile', 4),
    ('massage', 'beauty-wellness',
      '{"me":"Masaža","sr":"Масажа","en":"Massage","tr":"Masaj","de":"Massage","it":"Massaggio","ru":"Массаж","ar":"تدليك","uk":"Масаж"}'::jsonb,
      'HandHeart', 5),
    ('brow-design', 'beauty-wellness',
      '{"me":"Dizajn obrva","sr":"Дизајн обрва","en":"Brow Design","tr":"Kaş Tasarımı","de":"Augenbrauendesign","it":"Design sopracciglia","ru":"Дизайн бровей","ar":"تصميم الحواجب","uk":"Дизайн брів"}'::jsonb,
      'Eye', 6),
    ('bridal-prep', 'beauty-wellness',
      '{"me":"Mladenačka priprema","sr":"Свадбена припрема","en":"Bridal Prep","tr":"Gelin Hazırlık","de":"Brautstyling","it":"Preparazione sposa","ru":"Подготовка невесты","ar":"تحضير العروس","uk":"Підготовка нареченої"}'::jsonb,
      'Crown', 7),
    ('hair-extensions', 'beauty-wellness',
      '{"me":"Nadogradnja kose","sr":"Надоградња косе","en":"Hair Extensions","tr":"Saç Kaynağı","de":"Haarverlängerung","it":"Extension capelli","ru":"Наращивание волос","ar":"وصلات الشعر","uk":"Нарощування волосся"}'::jsonb,
      'Sparkles', 8),
    ('laser-hair-removal', 'beauty-wellness',
      '{"me":"Lasersko uklanjanje","sr":"Ласерско уклањање","en":"Laser Hair Removal","tr":"Lazer Epilasyon","de":"Laser-Haarentfernung","it":"Epilazione laser","ru":"Лазерная эпиляция","ar":"إزالة شعر بالليزر","uk":"Лазерна епіляція"}'::jsonb,
      'Zap', 9),

    -- ===== catering-food subs (7) =====
    ('wedding-catering', 'catering-food',
      '{"me":"Svadbeni catering","sr":"Свадбени кетеринг","en":"Wedding Catering","tr":"Düğün Catering","de":"Hochzeitscatering","it":"Catering matrimonio","ru":"Свадебный кейтеринг","ar":"تموين أفراح","uk":"Весільний кейтеринг"}'::jsonb,
      'PartyPopper', 1),
    ('birthday-cake', 'catering-food',
      '{"me":"Rođendanske torte","sr":"Рођенданске торте","en":"Birthday Cake","tr":"Doğum Günü Pastası","de":"Geburtstagstorte","it":"Torta compleanno","ru":"Торт на ДР","ar":"كعك أعياد ميلاد","uk":"Торт на день народження"}'::jsonb,
      'Cake', 2),
    ('corporate-catering', 'catering-food',
      '{"me":"Korporativni catering","sr":"Корпоративни кетеринг","en":"Corporate Catering","tr":"Kurumsal Catering","de":"Firmencatering","it":"Catering aziendale","ru":"Корп. кейтеринг","ar":"تموين شركات","uk":"Корпоративний кейтеринг"}'::jsonb,
      'Briefcase', 3),
    ('home-cooking', 'catering-food',
      '{"me":"Kućno kuvanje","sr":"Кућно кување","en":"Home Cooking","tr":"Ev Yemeği","de":"Hausmannskost","it":"Cucina casalinga","ru":"Домашняя кухня","ar":"طبخ منزلي","uk":"Домашня кухня"}'::jsonb,
      'ChefHat', 4),
    ('turkish-cuisine', 'catering-food',
      '{"me":"Turska kuhinja","sr":"Турска кухиња","en":"Turkish Cuisine","tr":"Türk Mutfağı","de":"Türkische Küche","it":"Cucina turca","ru":"Турецкая кухня","ar":"مطبخ تركي","uk":"Турецька кухня"}'::jsonb,
      'UtensilsCrossed', 5),
    ('boutique-events', 'catering-food',
      '{"me":"Butik događaji","sr":"Бутик догађаји","en":"Boutique Events","tr":"Butik Etkinlik","de":"Boutique-Events","it":"Eventi boutique","ru":"Бутик-мероприятия","ar":"فعاليات بوتيك","uk":"Бутік-події"}'::jsonb,
      'Star', 6),
    ('ramadan-iftar', 'catering-food',
      '{"me":"Ramazan iftar","sr":"Рамазан ифтар","en":"Ramadan Iftar","tr":"Ramazan İftarı","de":"Ramadan-Iftar","it":"Iftar Ramadan","ru":"Рамадан ифтар","ar":"إفطار رمضان","uk":"Рамадан іфтар"}'::jsonb,
      'Moon', 7),

    -- ===== tutoring-education subs (7) =====
    ('language-lessons', 'tutoring-education',
      '{"me":"Jezici","sr":"Језици","en":"Language Lessons","tr":"Dil Dersleri","de":"Sprachunterricht","it":"Lezioni lingue","ru":"Языки","ar":"دروس لغات","uk":"Мовні уроки"}'::jsonb,
      'Languages', 1),
    ('music-lessons', 'tutoring-education',
      '{"me":"Muzika","sr":"Музика","en":"Music Lessons","tr":"Müzik Dersleri","de":"Musikunterricht","it":"Lezioni musica","ru":"Музыка","ar":"دروس موسيقى","uk":"Музика"}'::jsonb,
      'Music', 2),
    ('math-tutoring', 'tutoring-education',
      '{"me":"Matematika","sr":"Математика","en":"Math Tutoring","tr":"Matematik Dersi","de":"Mathenachhilfe","it":"Ripetizioni matematica","ru":"Математика","ar":"دروس رياضيات","uk":"Математика"}'::jsonb,
      'Calculator', 3),
    ('university-prep', 'tutoring-education',
      '{"me":"Priprema fakultet","sr":"Припрема факултет","en":"University Prep","tr":"Üniversite Hazırlık","de":"Uni-Vorbereitung","it":"Preparazione università","ru":"Подготовка к ВУЗу","ar":"تحضير جامعي","uk":"Підготовка до ВНЗ"}'::jsonb,
      'GraduationCap', 4),
    ('online-lessons', 'tutoring-education',
      '{"me":"Online časovi","sr":"Онлајн часови","en":"Online Lessons","tr":"Online Ders","de":"Online-Unterricht","it":"Lezioni online","ru":"Онлайн уроки","ar":"دروس أونلاين","uk":"Онлайн уроки"}'::jsonb,
      'Monitor', 5),
    ('child-development', 'tutoring-education',
      '{"me":"Razvoj djeteta","sr":"Развој детета","en":"Child Development","tr":"Çocuk Gelişimi","de":"Kindesentwicklung","it":"Sviluppo bambini","ru":"Развитие ребёнка","ar":"تطوير الطفل","uk":"Розвиток дитини"}'::jsonb,
      'Sparkles', 6),
    ('art-lessons', 'tutoring-education',
      '{"me":"Likovni časovi","sr":"Ликовни часови","en":"Art Lessons","tr":"Resim Dersi","de":"Kunstunterricht","it":"Lezioni arte","ru":"Уроки рисования","ar":"دروس فنون","uk":"Уроки мистецтва"}'::jsonb,
      'Palette', 7),

    -- ===== childcare-family subs (7) =====
    ('babysitter', 'childcare-family',
      '{"me":"Bebisiterka","sr":"Бебиситерка","en":"Babysitter","tr":"Bebek Bakıcısı","de":"Babysitter","it":"Babysitter","ru":"Няня на час","ar":"جليسة أطفال","uk":"Бейбіситер"}'::jsonb,
      'Baby', 1),
    ('nanny-fulltime', 'childcare-family',
      '{"me":"Dadilja na puno radno vrijeme","sr":"Дадиља на пуно радно време","en":"Full-time Nanny","tr":"Tam Zamanlı Dadı","de":"Vollzeit-Kindermädchen","it":"Tata fissa","ru":"Постоянная няня","ar":"مربية متفرغة","uk":"Постійна няня"}'::jsonb,
      'HeartHandshake', 2),
    ('birthday-events', 'childcare-family',
      '{"me":"Organizacija rođendana","sr":"Организација рођендана","en":"Birthday Events","tr":"Doğum Günü Organizasyonu","de":"Kindergeburtstag","it":"Feste compleanno","ru":"Детские праздники","ar":"حفلات ميلاد","uk":"Дитячі дні народження"}'::jsonb,
      'Cake', 3),
    ('animator-clown', 'childcare-family',
      '{"me":"Animator-klovn","sr":"Аниматор-кловн","en":"Animator-Clown","tr":"Animatör-Palyaço","de":"Animateur-Clown","it":"Animatore-clown","ru":"Аниматор-клоун","ar":"منشط-مهرج","uk":"Аніматор-клоун"}'::jsonb,
      'Smile', 4),
    ('child-photographer', 'childcare-family',
      '{"me":"Dječji fotograf","sr":"Дечји фотограф","en":"Child Photographer","tr":"Çocuk Fotoğrafçı","de":"Kinderfotograf","it":"Fotografo bambini","ru":"Детский фотограф","ar":"مصور أطفال","uk":"Дитячий фотограф"}'::jsonb,
      'Camera', 5),
    ('tutor-young', 'childcare-family',
      '{"me":"Časovi za djecu","sr":"Часови за децу","en":"Young Tutoring","tr":"Çocuk Özel Dersi","de":"Nachhilfe Kinder","it":"Ripetizioni bambini","ru":"Уроки для детей","ar":"دروس للأطفال","uk":"Уроки для дітей"}'::jsonb,
      'BookOpen', 6),
    ('pet-sitting', 'childcare-family',
      '{"me":"Čuvanje kućnih ljubimaca","sr":"Чување љубимаца","en":"Pet Sitting","tr":"Pet Bakım","de":"Tierbetreuung","it":"Pet sitting","ru":"Передержка питомцев","ar":"العناية بالحيوانات","uk":"Догляд за тваринами"}'::jsonb,
      'PawPrint', 7),

    -- ===== moving-transport subs (7) =====
    ('home-moving', 'moving-transport',
      '{"me":"Selidba kuće","sr":"Селидба куће","en":"Home Moving","tr":"Ev Taşıma","de":"Privatumzug","it":"Trasloco casa","ru":"Переезд дома","ar":"نقل منزلي","uk":"Переїзд дому"}'::jsonb,
      'Truck', 1),
    ('office-moving', 'moving-transport',
      '{"me":"Selidba ureda","sr":"Селидба канцеларија","en":"Office Moving","tr":"Ofis Taşıma","de":"Büroumzug","it":"Trasloco ufficio","ru":"Переезд офиса","ar":"نقل مكتبي","uk":"Переїзд офісу"}'::jsonb,
      'Building', 2),
    ('single-item', 'moving-transport',
      '{"me":"Prevoz pojedinačnog komada","sr":"Превоз појединачног комада","en":"Single Item","tr":"Tek Parça Taşıma","de":"Einzelstück","it":"Oggetto singolo","ru":"Одна вещь","ar":"قطعة واحدة","uk":"Один предмет"}'::jsonb,
      'Package', 3),
    ('boat-bike-transport', 'moving-transport',
      '{"me":"Transport plovila i bicikala","sr":"Пловила и бицикли","en":"Boat & Bike Transport","tr":"Tekne ve Bisiklet Taşıma","de":"Boot-/Radtransport","it":"Trasporto barche/bici","ru":"Лодки и велосипеды","ar":"نقل قوارب ودراجات","uk":"Перевезення човнів"}'::jsonb,
      'Sailboat', 4),
    ('storage', 'moving-transport',
      '{"me":"Skladištenje","sr":"Складиштење","en":"Storage","tr":"Depolama","de":"Lagerung","it":"Magazzino","ru":"Хранение","ar":"تخزين","uk":"Зберігання"}'::jsonb,
      'Warehouse', 5),
    ('packing', 'moving-transport',
      '{"me":"Pakovanje","sr":"Паковање","en":"Packing","tr":"Paketleme","de":"Verpackung","it":"Imballaggio","ru":"Упаковка","ar":"تغليف","uk":"Пакування"}'::jsonb,
      'Box', 6),
    ('airport-transfer', 'moving-transport',
      '{"me":"Aerodromski transfer","sr":"Аеродромски трансфер","en":"Airport Transfer","tr":"Havalimanı Transferi","de":"Flughafentransfer","it":"Trasferimento aeroporto","ru":"Трансфер аэропорт","ar":"نقل المطار","uk":"Аеропорт-трансфер"}'::jsonb,
      'Plane', 7),

    -- ===== automotive subs (8) =====
    ('auto-repair', 'automotive',
      '{"me":"Auto popravak","sr":"Ауто поправка","en":"Auto Repair","tr":"Oto Tamir","de":"Autoreparatur","it":"Riparazioni auto","ru":"Авторемонт","ar":"إصلاح السيارات","uk":"Авторемонт"}'::jsonb,
      'Wrench', 1),
    ('tire-service', 'automotive',
      '{"me":"Servis guma","sr":"Сервис гума","en":"Tire Service","tr":"Lastik Servisi","de":"Reifenservice","it":"Servizio gomme","ru":"Шиномонтаж","ar":"خدمة إطارات","uk":"Шиномонтаж"}'::jsonb,
      'Disc', 2),
    ('car-wash', 'automotive',
      '{"me":"Pranje auta","sr":"Прање аута","en":"Car Wash","tr":"Oto Yıkama","de":"Autowäsche","it":"Autolavaggio","ru":"Автомойка","ar":"غسيل سيارات","uk":"Автомийка"}'::jsonb,
      'Droplets', 3),
    ('towing', 'automotive',
      '{"me":"Šlep služba","sr":"Шлеп служба","en":"Towing","tr":"Çekici","de":"Abschleppdienst","it":"Soccorso stradale","ru":"Эвакуатор","ar":"ونش سحب","uk":"Евакуатор"}'::jsonb,
      'Truck', 4),
    ('mobile-repair', 'automotive',
      '{"me":"Mobilni servis","sr":"Мобилни сервис","en":"Mobile Repair","tr":"Mobil Oto Tamir","de":"Mobiler Service","it":"Servizio mobile","ru":"Выездной ремонт","ar":"صيانة متنقلة","uk":"Мобільний сервіс"}'::jsonb,
      'Wrench', 5),
    ('auto-engine-service', 'automotive',
      '{"me":"Servis motora vozila","sr":"Сервис мотора возила","en":"Engine Service","tr":"Oto Motor Servisi","de":"Motorservice","it":"Servizio motore","ru":"Ремонт двигателя","ar":"صيانة محرك السيارة","uk":"Сервіс двигуна"}'::jsonb,
      'Cog', 6),
    ('detailing', 'automotive',
      '{"me":"Auto detalji","sr":"Ауто детаљи","en":"Auto Detailing","tr":"Oto Detaylı Bakım","de":"Aufbereitung","it":"Trattamento estetico","ru":"Детейлинг","ar":"تلميع تفصيلي","uk":"Детейлінг"}'::jsonb,
      'Sparkles', 7),
    ('expertise-inspection', 'automotive',
      '{"me":"Procjena vozila","sr":"Процена возила","en":"Vehicle Inspection","tr":"Araç Ekspertizi","de":"Fahrzeuggutachten","it":"Perizia auto","ru":"Экспертиза авто","ar":"فحص خبراء","uk":"Експертиза авто"}'::jsonb,
      'ClipboardCheck', 8),

    -- ===== airbnb-management subs (7) =====
    ('full-management', 'airbnb-management',
      '{"me":"Potpuno upravljanje","sr":"Потпуно управљање","en":"Full Management","tr":"Komple Yönetim","de":"Komplettverwaltung","it":"Gestione completa","ru":"Полное управление","ar":"إدارة كاملة","uk":"Повне управління"}'::jsonb,
      'Crown', 1),
    ('checkin-checkout', 'airbnb-management',
      '{"me":"Prijava-odjava","sr":"Пријава-одјава","en":"Check-in/out","tr":"Giriş & Çıkış İşlemleri","de":"Check-in/Check-out","it":"Check-in/out","ru":"Заезд-выезд","ar":"استقبال وتسليم","uk":"Заїзд-виїзд"}'::jsonb,
      'KeyRound', 2),
    ('turnover-cleaning', 'airbnb-management',
      '{"me":"Predaja čišćenje","sr":"Предаја чишћење","en":"Turnover Cleaning","tr":"Misafir Değişim Temizliği","de":"Wechselreinigung","it":"Pulizia cambio","ru":"Смена гостей","ar":"تنظيف بين الحجوزات","uk":"Прибирання між гостями"}'::jsonb,
      'RotateCw', 3),
    ('listing-photography', 'airbnb-management',
      '{"me":"Foto za oglase","sr":"Фото за огласе","en":"Listing Photography","tr":"İlan Fotoğrafçılığı","de":"Listingfotografie","it":"Foto annunci","ru":"Фото для объявления","ar":"تصوير إعلانات","uk":"Фото для оголошень"}'::jsonb,
      'Camera', 4),
    ('booking-management', 'airbnb-management',
      '{"me":"Upravljanje rezervacija","sr":"Управљање резервацијама","en":"Booking Management","tr":"Rezervasyon Yönetimi","de":"Buchungsmanagement","it":"Gestione prenotazioni","ru":"Управление бронями","ar":"إدارة الحجوزات","uk":"Управління бронюваннями"}'::jsonb,
      'Calendar', 5),
    ('maintenance', 'airbnb-management',
      '{"me":"Održavanje","sr":"Одржавање","en":"Maintenance","tr":"Bakım","de":"Wartung","it":"Manutenzione","ru":"Обслуживание","ar":"صيانة","uk":"Технічне обслуговування"}'::jsonb,
      'Wrench', 6),
    ('guest-support', 'airbnb-management',
      '{"me":"Podrška gostima","sr":"Подршка гостима","en":"Guest Support","tr":"Misafir Hizmetleri","de":"Gästeservice","it":"Assistenza ospiti","ru":"Поддержка гостей","ar":"دعم الضيوف","uk":"Підтримка гостей"}'::jsonb,
      'MessageCircle', 7)
)
INSERT INTO glatko_service_categories
  (slug, parent_id, name, icon, sort_order, is_p0, translation_status, is_active)
SELECT
  s.slug,
  pl.id,
  s.name,
  s.icon,
  s.sort_order,
  TRUE,
  (SELECT s FROM verified_status),
  TRUE
FROM sub_data s
JOIN parent_lookup pl ON pl.slug = s.parent_slug
ON CONFLICT (slug) DO UPDATE SET
  parent_id          = EXCLUDED.parent_id,
  name               = EXCLUDED.name,
  icon               = EXCLUDED.icon,
  sort_order         = EXCLUDED.sort_order,
  is_p0              = TRUE,
  translation_status = EXCLUDED.translation_status,
  is_active          = TRUE;

-- ----------------------------------------------------------------------------
-- 7. Soft-delete existing subs not in master
-- ----------------------------------------------------------------------------

UPDATE glatko_service_categories
SET is_active = FALSE
WHERE slug IN ('renovation','ac-heating','garden','pool','emergency-repair','haul-out');

-- ----------------------------------------------------------------------------
-- 8. Soft-delete home-services root, GUARDED by active sub count
--    Refuses to soft-delete if any active sub still has parent_id = home-services
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  active_subs_count INT;
  home_services_id UUID;
BEGIN
  SELECT id INTO home_services_id
  FROM glatko_service_categories
  WHERE slug = 'home-services';

  IF home_services_id IS NULL THEN
    RAISE NOTICE 'home-services row does not exist; skipping soft-delete guard';
    RETURN;
  END IF;

  SELECT COUNT(*) INTO active_subs_count
  FROM glatko_service_categories
  WHERE parent_id = home_services_id
    AND is_active = TRUE;

  IF active_subs_count > 0 THEN
    RAISE EXCEPTION 'Refusing to soft-delete home-services: % active subs still attached. Reparent or soft-delete them first.', active_subs_count;
  END IF;

  UPDATE glatko_service_categories SET is_active = FALSE WHERE id = home_services_id;
END $$;

COMMIT;

-- ============================================================================
-- 9. Verification queries (run after COMMIT to confirm state)
-- ============================================================================

-- 9a. P0 root count (expect 10)
SELECT 'p0_root_count' AS check_name, COUNT(*) AS value
FROM glatko_service_categories
WHERE is_p0 = TRUE AND parent_id IS NULL;

-- 9b. P0 sub count (expect 75)
SELECT 'p0_sub_count' AS check_name, COUNT(*) AS value
FROM glatko_service_categories
WHERE is_p0 = TRUE AND parent_id IS NOT NULL;

-- 9c. P0 roots with metadata sanity check
SELECT slug, name->>'me' AS name_me, hero_image_url, seasonal, badge_priority
FROM glatko_service_categories
WHERE is_p0 = TRUE AND parent_id IS NULL
ORDER BY badge_priority;

-- 9d. Sub count per P0 root (expect: boat-services 8, home-cleaning 7, renovation-construction 8, beauty-wellness 9, catering-food 7, tutoring-education 7, childcare-family 7, moving-transport 7, automotive 8, airbnb-management 7)
SELECT p.slug AS parent_slug, COUNT(c.id) AS sub_count
FROM glatko_service_categories p
LEFT JOIN glatko_service_categories c ON c.parent_id = p.id AND c.is_active = TRUE
WHERE p.is_p0 = TRUE AND p.parent_id IS NULL
GROUP BY p.slug
ORDER BY p.slug;

-- 9e. Soft-deleted (expect: home-services + 6 subs = 7 total inactive among legacy slugs)
SELECT slug, is_active
FROM glatko_service_categories
WHERE slug IN ('home-services','renovation','ac-heating','garden','pool','emergency-repair','haul-out')
ORDER BY slug;

-- 9f. Icon casing sanity (expect ALL P0 rows have PascalCase icons; no lowercase remaining among P0 rows)
SELECT COUNT(*) FILTER (WHERE icon = INITCAP(icon) OR icon ~ '^[A-Z]') AS pascalcase_count,
       COUNT(*) FILTER (WHERE icon ~ '^[a-z]') AS lowercase_count
FROM glatko_service_categories
WHERE is_p0 = TRUE;

-- 9g. Storage bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'category-images';
