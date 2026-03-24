-- ═══════════════════════════════════════════════
-- GLATKO G1 — Foundation Migration
-- Aynı Supabase projesi (Fijaka ile paylaşımlı)
-- Tüm tablolar glatko_ prefix'li
-- ═══════════════════════════════════════════════

-- PostGIS zaten aktif (Fijaka için açılmıştı)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ═══════════════════════════════════════════════
-- 1. HİZMET KATEGORİLERİ (hiyerarşik ağaç)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES glatko_service_categories(id),
  slug TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gsc_parent ON glatko_service_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_gsc_slug ON glatko_service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_gsc_active ON glatko_service_categories(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════
-- 2. PROFESYONEL PROFİLLER
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_professional_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  phone TEXT,
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  years_experience INT,
  location GEOGRAPHY(POINT, 4326),
  location_city TEXT,
  service_radius_km INT DEFAULT 25,
  languages TEXT[] DEFAULT '{"en"}',
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending','in_review','approved','rejected')),
  rejection_reason TEXT,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  response_time_minutes INT,
  insurance_status TEXT DEFAULT 'none'
    CHECK (insurance_status IN ('none','self_reported','verified')),
  portfolio_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gpp_location ON glatko_professional_profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_gpp_city ON glatko_professional_profiles(location_city);
CREATE INDEX IF NOT EXISTS idx_gpp_status ON glatko_professional_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_gpp_active_verified ON glatko_professional_profiles(is_active, is_verified)
  WHERE is_active = true AND is_verified = true;
CREATE INDEX IF NOT EXISTS idx_gpp_rating ON glatko_professional_profiles(avg_rating DESC)
  WHERE is_active = true AND is_verified = true;

-- ═══════════════════════════════════════════════
-- 3. PROFESYONEL ↔ KATEGORİ BAĞLANTISI
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_pro_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES glatko_service_categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  custom_rate_min DECIMAL(10,2),
  custom_rate_max DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_gps_pro ON glatko_pro_services(professional_id);
CREATE INDEX IF NOT EXISTS idx_gps_cat ON glatko_pro_services(category_id);

-- ═══════════════════════════════════════════════
-- 4. HİZMET TALEPLERİ (müşteri iş oluşturur)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES glatko_service_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  municipality TEXT,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  preferred_date_start DATE,
  preferred_date_end DATE,
  urgency TEXT DEFAULT 'flexible'
    CHECK (urgency IN ('asap','this_week','flexible','specific_date')),
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','published','bidding','assigned',
                      'in_progress','completed','reviewed',
                      'closed','expired','cancelled')),
  max_bids INT DEFAULT 4,
  bid_count INT DEFAULT 0,
  assigned_bid_id UUID,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gsr_customer ON glatko_service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_gsr_category ON glatko_service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_gsr_status ON glatko_service_requests(status)
  WHERE status IN ('published','bidding');
CREATE INDEX IF NOT EXISTS idx_gsr_location ON glatko_service_requests USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_gsr_created ON glatko_service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gsr_expires ON glatko_service_requests(expires_at)
  WHERE status IN ('published','bidding');

-- ═══════════════════════════════════════════════
-- 5. TEKLİFLER (profesyonel fiyat verir)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES glatko_service_requests(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id),
  price DECIMAL(10,2) NOT NULL,
  price_type TEXT DEFAULT 'fixed'
    CHECK (price_type IN ('fixed','hourly','estimate')),
  message TEXT,
  estimated_duration_hours DECIMAL(5,1),
  available_date DATE,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','withdrawn','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_request_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_gb_request ON glatko_bids(service_request_id);
CREATE INDEX IF NOT EXISTS idx_gb_professional ON glatko_bids(professional_id);
CREATE INDEX IF NOT EXISTS idx_gb_status ON glatko_bids(status);

ALTER TABLE glatko_service_requests
  ADD CONSTRAINT fk_gsr_assigned_bid
  FOREIGN KEY (assigned_bid_id) REFERENCES glatko_bids(id);

-- ═══════════════════════════════════════════════
-- 6. TEKLİF SAYISI ENFORCE TRIGGER
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION glatko_on_bid_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  current_count INT;
  max_allowed INT;
BEGIN
  SELECT bid_count, max_bids INTO current_count, max_allowed
  FROM glatko_service_requests
  WHERE id = NEW.service_request_id
  FOR UPDATE;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Maximum bids (%) reached', max_allowed;
  END IF;

  UPDATE glatko_service_requests
  SET bid_count = bid_count + 1,
      status = CASE WHEN status = 'published' THEN 'bidding' ELSE status END,
      updated_at = now()
  WHERE id = NEW.service_request_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_glatko_bid_insert ON glatko_bids;
CREATE TRIGGER trg_glatko_bid_insert
  BEFORE INSERT ON glatko_bids
  FOR EACH ROW EXECUTE FUNCTION glatko_on_bid_insert();

-- ═══════════════════════════════════════════════
-- 7. DEĞERLENDİRMELER (iki taraflı)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES glatko_service_requests(id),
  bid_id UUID NOT NULL REFERENCES glatko_bids(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  reviewer_role TEXT NOT NULL
    CHECK (reviewer_role IN ('customer','professional')),
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  review_text TEXT,
  photos TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_request_id, reviewer_role)
);

CREATE INDEX IF NOT EXISTS idx_gr_request ON glatko_reviews(service_request_id);
CREATE INDEX IF NOT EXISTS idx_gr_reviewee ON glatko_reviews(reviewee_id);

CREATE OR REPLACE FUNCTION glatko_on_review_insert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  both_exist BOOLEAN;
  new_avg DECIMAL;
  new_count INT;
BEGIN
  SELECT COUNT(*) = 2 INTO both_exist
  FROM glatko_reviews WHERE service_request_id = NEW.service_request_id;

  IF both_exist THEN
    UPDATE glatko_reviews SET is_published = true
    WHERE service_request_id = NEW.service_request_id;

    UPDATE glatko_service_requests
    SET status = 'reviewed', updated_at = now()
    WHERE id = NEW.service_request_id;
  END IF;

  IF NEW.reviewer_role = 'customer' THEN
    SELECT AVG(overall_rating), COUNT(*)
    INTO new_avg, new_count
    FROM glatko_reviews
    WHERE reviewee_id = NEW.reviewee_id AND reviewer_role = 'customer'
      AND is_published = true;

    UPDATE glatko_professional_profiles
    SET avg_rating = COALESCE(new_avg, 0),
        total_reviews = COALESCE(new_count, 0)
    WHERE id = NEW.reviewee_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_glatko_review_insert ON glatko_reviews;
CREATE TRIGGER trg_glatko_review_insert
  AFTER INSERT ON glatko_reviews
  FOR EACH ROW EXECUTE FUNCTION glatko_on_review_insert();

-- ═══════════════════════════════════════════════
-- 8. HİZMET PAKETLERİ
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES glatko_service_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  price_type TEXT DEFAULT 'fixed'
    CHECK (price_type IN ('fixed','starting_at')),
  estimated_duration_hours DECIMAL(5,1),
  includes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 9. MÜSAİTLİK TAKVİMİ
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  UNIQUE(professional_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS glatko_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  note TEXT,
  UNIQUE(professional_id, date)
);

-- ═══════════════════════════════════════════════
-- 10. KONUŞMALAR + MESAJLAR
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES glatko_service_requests(id),
  bid_id UUID REFERENCES glatko_bids(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  professional_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_request_id, customer_id, professional_id)
);

CREATE TABLE IF NOT EXISTS glatko_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES glatko_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  content_type TEXT DEFAULT 'text'
    CHECK (content_type IN ('text','image','file')),
  file_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gm_conversation ON glatko_messages(conversation_id, created_at DESC);

-- ═══════════════════════════════════════════════
-- 11. DOĞRULAMA BELGELERİ
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES glatko_professional_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL
    CHECK (document_type IN ('id_card','business_license','certificate','insurance','other')),
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gvd_pro ON glatko_verification_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_gvd_status ON glatko_verification_documents(status)
  WHERE status = 'pending';

-- ═══════════════════════════════════════════════
-- 12. BİLDİRİMLER
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS glatko_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL
    CHECK (type IN ('new_bid','bid_accepted','bid_rejected',
                    'message','status_change','review',
                    'verification_approved','verification_rejected',
                    'new_request_match')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gn_user_unread ON glatko_notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- ═══════════════════════════════════════════════
-- RLS POLİTİKALARI
-- ═══════════════════════════════════════════════

ALTER TABLE glatko_professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active profiles"
  ON glatko_professional_profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users manage own profile"
  ON glatko_professional_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE glatko_service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active requests"
  ON glatko_service_requests FOR SELECT
  USING (status NOT IN ('draft','cancelled'));

CREATE POLICY "Customers manage own requests"
  ON glatko_service_requests FOR ALL
  USING (auth.uid() = customer_id);

ALTER TABLE glatko_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers see bids on their requests"
  ON glatko_bids FOR SELECT
  USING (
    service_request_id IN (
      SELECT id FROM glatko_service_requests WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Pros manage own bids"
  ON glatko_bids FOR ALL
  USING (auth.uid() = professional_id);

ALTER TABLE glatko_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see their messages"
  ON glatko_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM glatko_conversations
      WHERE customer_id = auth.uid() OR professional_id = auth.uid()
    )
  );

CREATE POLICY "Participants send messages"
  ON glatko_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

ALTER TABLE glatko_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON glatko_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON glatko_notifications FOR UPDATE
  USING (auth.uid() = user_id);

ALTER TABLE glatko_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros see own documents"
  ON glatko_verification_documents FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Pros upload own documents"
  ON glatko_verification_documents FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

ALTER TABLE glatko_service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON glatko_service_categories FOR SELECT
  USING (is_active = true);

ALTER TABLE glatko_pro_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pro services"
  ON glatko_pro_services FOR SELECT
  USING (true);

CREATE POLICY "Pros manage own services"
  ON glatko_pro_services FOR ALL
  USING (auth.uid() = professional_id);

ALTER TABLE glatko_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reviews"
  ON glatko_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Participants can view own reviews"
  ON glatko_reviews FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

CREATE POLICY "Users create own reviews"
  ON glatko_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- ═══════════════════════════════════════════════
-- SEED DATA — Hizmet Kategorileri (Karadağ)
-- ═══════════════════════════════════════════════

INSERT INTO glatko_service_categories (slug, name, description, icon, sort_order) VALUES
('home-services',
 '{"tr":"Ev Temizlik & Tadilat","en":"Home Cleaning & Renovation","de":"Hausreinigung & Renovierung","it":"Pulizia Casa & Ristrutturazione","ru":"Уборка и ремонт дома","uk":"Прибирання та ремонт дому","sr":"Čišćenje i renoviranje kuće","me":"Čišćenje i renoviranje kuće","ar":"تنظيف المنزل والتجديد"}',
 '{"tr":"Villa temizliği, derin temizlik, boya-badana, elektrik, tesisat","en":"Villa cleaning, deep cleaning, painting, electrical, plumbing","de":"Villa-Reinigung, Grundreinigung, Malerarbeiten, Elektrik, Sanitär","it":"Pulizia villa, pulizia profonda, pittura, elettricista, idraulico","ru":"Уборка вилл, генеральная уборка, покраска, электрика, сантехника","uk":"Прибирання вілл, генеральне прибирання, фарбування, електрика, сантехніка","sr":"Čišćenje vila, dubinsko čišćenje, farbanje, elektrika, vodoinstalacija","me":"Čišćenje vila, dubinsko čišćenje, farbanje, elektrika, vodoinstalacija","ar":"تنظيف الفلل، التنظيف العميق، الدهان، الكهرباء، السباكة"}',
 'home', 1),
('boat-services',
 '{"tr":"Tekne Bakım & Kaptan","en":"Boat Maintenance & Captain","de":"Bootswartung & Kapitän","it":"Manutenzione Barca & Capitano","ru":"Обслуживание яхт и капитан","uk":"Обслуговування яхт та капітан","sr":"Održavanje brodova i kapetan","me":"Održavanje brodova i kapetan","ar":"صيانة القوارب والقبطان"}',
 '{"tr":"Antifouling, motor servis, kaptan kiralama, gövde temizlik","en":"Antifouling, engine service, captain hire, hull cleaning","de":"Antifouling, Motorservice, Kapitän-Vermietung, Rumpfreinigung","it":"Antifouling, servizio motore, noleggio capitano, pulizia scafo","ru":"Антифоулинг, обслуживание двигателя, аренда капитана, очистка корпуса","uk":"Антифоулінг, обслуговування двигуна, оренда капітана, очищення корпусу","sr":"Antifouling, servis motora, iznajmljivanje kapetana, čišćenje trupa","me":"Antifouling, servis motora, iznajmljivanje kapetana, čišćenje trupa","ar":"مكافحة الحشف، خدمة المحرك، استئجار قبطان، تنظيف الهيكل"}',
 'anchor', 2);

INSERT INTO glatko_service_categories (parent_id, slug, name, icon, sort_order)
SELECT id, sub.slug, sub.name::jsonb, sub.icon, sub.sort_order
FROM glatko_service_categories, (VALUES
  ('general-cleaning', '{"tr":"Genel Temizlik","en":"General Cleaning","de":"Allgemeine Reinigung","it":"Pulizia Generale","ru":"Общая уборка","uk":"Загальне прибирання","sr":"Opšte čišćenje","me":"Opšte čišćenje","ar":"تنظيف عام"}', 'sparkles', 1),
  ('deep-cleaning', '{"tr":"Derin Temizlik","en":"Deep Cleaning","de":"Grundreinigung","it":"Pulizia Profonda","ru":"Генеральная уборка","uk":"Генеральне прибирання","sr":"Dubinsko čišćenje","me":"Dubinsko čišćenje","ar":"تنظيف عميق"}', 'sparkles', 2),
  ('villa-airbnb', '{"tr":"Villa / Airbnb Temizliği","en":"Villa / Airbnb Cleaning","de":"Villa / Airbnb Reinigung","it":"Pulizia Villa / Airbnb","ru":"Уборка вилл / Airbnb","uk":"Прибирання вілл / Airbnb","sr":"Čišćenje vila / Airbnb","me":"Čišćenje vila / Airbnb","ar":"تنظيف الفلل / Airbnb"}', 'home', 3),
  ('renovation', '{"tr":"Tadilat & Renovasyon","en":"Renovation & Remodeling","de":"Renovierung & Umbau","it":"Ristrutturazione","ru":"Ремонт и реконструкция","uk":"Ремонт та реконструкція","sr":"Renoviranje","me":"Renoviranje","ar":"التجديد وإعادة التصميم"}', 'hammer', 4),
  ('painting', '{"tr":"Boya-Badana","en":"Painting & Decoration","de":"Malerarbeiten","it":"Pittura e Decorazione","ru":"Покраска и отделка","uk":"Фарбування та оздоблення","sr":"Farbanje","me":"Farbanje","ar":"الدهان والديكور"}', 'paintbrush', 5),
  ('electrical', '{"tr":"Elektrik Tesisatı","en":"Electrical Services","de":"Elektroinstallation","it":"Servizi Elettrici","ru":"Электромонтажные работы","uk":"Електромонтажні роботи","sr":"Elektroinstalacije","me":"Elektroinstalacije","ar":"خدمات كهربائية"}', 'zap', 6),
  ('plumbing', '{"tr":"Su Tesisatı","en":"Plumbing","de":"Sanitärinstallation","it":"Idraulica","ru":"Сантехнические работы","uk":"Сантехнічні роботи","sr":"Vodoinstalacije","me":"Vodoinstalacije","ar":"السباكة"}', 'droplets', 7),
  ('ac-heating', '{"tr":"Klima & Isıtma","en":"AC & Heating","de":"Klimaanlage & Heizung","it":"Aria Condizionata & Riscaldamento","ru":"Кондиционирование и отопление","uk":"Кондиціонування та опалення","sr":"Klima i grejanje","me":"Klima i grijanje","ar":"التكييف والتدفئة"}', 'thermometer', 8),
  ('furniture-assembly', '{"tr":"Mobilya Montajı","en":"Furniture Assembly","de":"Möbelmontage","it":"Montaggio Mobili","ru":"Сборка мебели","uk":"Збирання меблів","sr":"Montaža nameštaja","me":"Montaža namještaja","ar":"تجميع الأثاث"}', 'sofa', 9),
  ('garden', '{"tr":"Bahçe Bakımı","en":"Garden Maintenance","de":"Gartenpflege","it":"Manutenzione Giardino","ru":"Уход за садом","uk":"Догляд за садом","sr":"Održavanje bašte","me":"Održavanje bašte","ar":"صيانة الحدائق"}', 'trees', 10),
  ('pool', '{"tr":"Havuz Temizliği","en":"Pool Cleaning","de":"Poolreinigung","it":"Pulizia Piscina","ru":"Чистка бассейна","uk":"Чистка басейну","sr":"Čišćenje bazena","me":"Čišćenje bazena","ar":"تنظيف المسبح"}', 'waves', 11)
) AS sub(slug, name, icon, sort_order)
WHERE glatko_service_categories.slug = 'home-services';

INSERT INTO glatko_service_categories (parent_id, slug, name, icon, sort_order)
SELECT id, sub.slug, sub.name::jsonb, sub.icon, sub.sort_order
FROM glatko_service_categories, (VALUES
  ('captain-hire', '{"tr":"Kaptan Kiralama","en":"Captain Hire","de":"Kapitän-Vermietung","it":"Noleggio Capitano","ru":"Аренда капитана","uk":"Оренда капітана","sr":"Iznajmljivanje kapetana","me":"Iznajmljivanje kapetana","ar":"استئجار قبطان"}', 'user', 1),
  ('antifouling', '{"tr":"Antifouling","en":"Antifouling","de":"Antifouling","it":"Antifouling","ru":"Антифоулинг","uk":"Антифоулінг","sr":"Antifouling","me":"Antifouling","ar":"مكافحة الحشف"}', 'shield', 2),
  ('engine-service', '{"tr":"Motor Servis","en":"Engine Service","de":"Motorservice","it":"Servizio Motore","ru":"Обслуживание двигателя","uk":"Обслуговування двигуна","sr":"Servis motora","me":"Servis motora","ar":"خدمة المحرك"}', 'settings', 3),
  ('hull-cleaning', '{"tr":"Gövde Temizlik & Polisaj","en":"Hull Cleaning & Polishing","de":"Rumpfreinigung & Politur","it":"Pulizia e Lucidatura Scafo","ru":"Очистка и полировка корпуса","uk":"Очищення та полірування корпусу","sr":"Čišćenje i poliranje trupa","me":"Čišćenje i poliranje trupa","ar":"تنظيف وتلميع الهيكل"}', 'brush', 4),
  ('winterization', '{"tr":"Kışlama","en":"Winterization","de":"Einwinterung","it":"Rimessaggio Invernale","ru":"Консервация на зиму","uk":"Консервація на зиму","sr":"Zimovanje","me":"Zimovanje","ar":"التجهيز لفصل الشتاء"}', 'snowflake', 5),
  ('charter-prep', '{"tr":"Charter Hazırlık","en":"Charter Preparation","de":"Charter-Vorbereitung","it":"Preparazione Charter","ru":"Подготовка к чартеру","uk":"Підготовка до чартеру","sr":"Priprema za čarter","me":"Priprema za čarter","ar":"تحضير الإيجار"}', 'clipboard', 6),
  ('emergency-repair', '{"tr":"Acil Onarım","en":"Emergency Repair","de":"Notfallreparatur","it":"Riparazione di Emergenza","ru":"Аварийный ремонт","uk":"Аварійний ремонт","sr":"Hitna popravka","me":"Hitna popravka","ar":"إصلاح طارئ"}', 'alert-triangle', 7),
  ('haul-out', '{"tr":"Karaya Çıkarma & Transport","en":"Haul Out & Transport","de":"Kranen & Transport","it":"Alaggio e Trasporto","ru":"Подъём и транспортировка","uk":"Підйом та транспортування","sr":"Izvlačenje i transport","me":"Izvlačenje i transport","ar":"السحب والنقل"}', 'truck', 8)
) AS sub(slug, name, icon, sort_order)
WHERE glatko_service_categories.slug = 'boat-services';
