# Glatko Kategori Sistemi — Mevcut Durum Raporu

**Audit tarihi:** 2026-04-28
**Branch:** `migration/supabase-split`
**Kapsam:** Read-only — hiçbir DB / kod değişikliği yapılmadı, hiçbir migration çalıştırılmadı.
**Kaynak:** `/Users/rohatkahraman/Desktop/glatko-frontend`

> **Not:** Tüm bulgular `file:line` referansı ile verilmiştir. Bilinmeyen veya
> tespit edilemeyen bilgiler "**tespit edilemedi**" olarak işaretlenmiştir.

---

## TL;DR (Yönetici Özeti)

| Konu | Durum |
|---|---|
| Toplam kategori | **21** (2 kök + 19 alt) — `supabase/migrations/001_glatko_foundation.sql` içine seed edilmiş |
| Hiyerarşi modeli | 2 seviyeli, self-referencing `parent_id` (ne ltree ne materialized path) |
| i18n stratejisi | DB'de `JSONB` kolonlar (`name`, `description`); 9 dil (tr/en/de/it/ru/uk/sr/me/ar) |
| Pro ↔ Kategori | M:N junction tablosu `glatko_pro_services` (+ `is_primary` bayrağı) |
| Talep ↔ Kategori | Tek FK (`glatko_service_requests.category_id`), nullable, **multi-category değil** |
| Aceternity (yüklü) | 6 dosya: background-grids, collision-beam, featured-images (KULLANILMIYOR), hero-background, lines-gradient, spotlight-effect |
| Aceternity (yok) | bento-grid, card-hover-effect, 3d-card, animated-tooltip, focus-cards, glowing-stars, background-beams, lens, evervault-card, infinite-moving-cards, wobble-card, sticky-scroll-reveal, lamp-effect, tracing-beam |
| Kategori görselleri | **Hiç yok** — `public/categories/` mevcut değil; sadece lucide-react ikonları |
| Arama altyapısı | DB'den çekip JS tarafında `String.includes()` — **FTS yok**, **synonym yok**, **embedding yok** |
| Per-kategori sorular | `StepDetails.tsx`'te `if (slug === ...)` ile **hardcoded** (DB'de değil) |
| SEO | OG meta var, sitemap'te tüm kategori URL'leri var; **BreadcrumbList JSON-LD yok**, dynamic OG image yok |

---

## 1. Database Katmanı

### 1.1 Migration dosyaları envanteri

`supabase/migrations/` (toplam 9 dosya):

| Dosya | Kategoriyle ilgili mi? | Özet |
|---|---|---|
| `001_glatko_foundation.sql` | **EVET** | Tüm temel tablolar + 21 kategori seed + RLS |
| `002_glatko_completed_jobs_trigger.sql` | hayır | Talep tamamlanınca pro'nun job sayacını arttırır |
| `003_glatko_notifications_realtime.sql` | hayır | `glatko_notifications` realtime publication |
| `004_glatko_profiles_user_fields.sql` | hayır | `profiles` tablosuna user metadata kolonları |
| `005_avatars_bucket.sql` | hayır | Storage bucket: `avatars` |
| `006_request_photos_bucket.sql` | hayır | Storage bucket: `glatko-request-photos` |
| `007_request_preferred_professional.sql` | dolaylı | `service_requests`'e `preferred_professional_id` FK ekler |
| `008_message_translation.sql` | hayır | Mesaj çevirisi alanları |
| `009_welcome_email_flag.sql` | hayır | Onboarding bayrakları |

> **Tüm kategori şeması ve seed verisi tek bir migration'da:** `001_glatko_foundation.sql`.
> Sonraki dosyalarda kategoriyle ilgili **hiçbir yapısal değişiklik yok** (yeni kategori eklenmemiş, kolon eklenmemiş, indexlere dokunulmamış).

### 1.2 `glatko_service_categories` — şema dump

[`supabase/migrations/001_glatko_foundation.sql:13-27`](supabase/migrations/001_glatko_foundation.sql)

```sql
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
```

**Kolonlar**

| Kolon | Tip | Null | Default | Notlar |
|---|---|---|---|---|
| `id` | UUID | NOT NULL | `gen_random_uuid()` | PK |
| `parent_id` | UUID | NULL | — | Self-FK (ON DELETE belirtilmemiş → RESTRICT) |
| `slug` | TEXT | NOT NULL | — | UNIQUE |
| `name` | JSONB | NOT NULL | — | `{ "tr": "...", "en": "...", ... }` |
| `description` | JSONB | NULL | — | Aynı format |
| `icon` | TEXT | NULL | — | Lucide icon adı (ör. `home`, `anchor`) |
| `sort_order` | INT | NULL | `0` | Görüntü sıralaması |
| `is_active` | BOOLEAN | NULL | `true` | Soft delete yerine kullanılıyor |
| `created_at` | TIMESTAMPTZ | NULL | `now()` | `updated_at` **YOK** |

**RLS** — `supabase/migrations/001_glatko_foundation.sql:439-443`

```sql
ALTER TABLE glatko_service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON glatko_service_categories FOR SELECT
  USING (is_active = true);
```

- `INSERT/UPDATE/DELETE` için **politika yok** → sadece service-role yazabilir.
- Trigger yok.

### 1.3 Hiyerarşi modeli

**Kullanılan teknik:** `parent_id` self-reference, **2 seviyeli** sığ bir ağaç. Materialized path / ltree / nested-set / closure-table **yok**.

Ağaç in-memory olarak [`lib/supabase/glatko.server.ts:14-42`](lib/supabase/glatko.server.ts) içinde kuruluyor:

```ts
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { data } = await supabase
    .from("glatko_service_categories")
    .select("*").eq("is_active", true).order("sort_order");
  // ...
  for (const row of rows) {
    if (row.parent_id) childMap.get(row.parent_id) ?? [].push(row);
    else roots.push(row);
  }
  for (const root of roots) root.children = childMap.get(root.id) ?? [];
  return roots;
}
```

> 3+ seviyeli alt-kategori (örn. *Ev hizmetleri > Temizlik > Halı yıkama*) **bu modelle desteklenmiyor**. Halı yıkama eklenmek istenirse "general-cleaning" yanına yeni bir root-altı kategori olarak gelmek zorunda.

### 1.4 İlişki tabloları

#### Pro ↔ Kategori (`glatko_pro_services`)

[`supabase/migrations/001_glatko_foundation.sql:72-84`](supabase/migrations/001_glatko_foundation.sql)

```sql
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

CREATE INDEX idx_gps_pro ON glatko_pro_services(professional_id);
CREATE INDEX idx_gps_cat ON glatko_pro_services(category_id);
```

**RLS:**
```sql
CREATE POLICY "Anyone can view pro services" ON glatko_pro_services FOR SELECT USING (true);
CREATE POLICY "Pros manage own services"     ON glatko_pro_services FOR ALL USING (auth.uid() = professional_id);
```

- M:N. Pro birden fazla kategoriye hizmet verebilir, sadece biri `is_primary = true` olur.
- `custom_rate_min/max` — pronun kategoriye özel kendi fiyat aralığı (kategori default'unu ezer).

#### Talep ↔ Kategori (`glatko_service_requests.category_id`)

[`supabase/migrations/001_glatko_foundation.sql:89-125`](supabase/migrations/001_glatko_foundation.sql)

```sql
CREATE TABLE IF NOT EXISTS glatko_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES glatko_service_categories(id),  -- NULLABLE, tek FK
  title TEXT NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  ...
);
CREATE INDEX idx_gsr_category ON glatko_service_requests(category_id);
```

- **Tek kategori** modeli. Multi-category talep mümkün değil.
- `category_id` **nullable** — bu, "kategori belirsiz" taleplere izin veriyor (büyük ihtimalle istenmeyen bir esneklik).
- Kategoriye özel sorular `details JSONB` içinde tutuluyor (bkz. §4).

#### `glatko_service_packages.category_id`

[`supabase/migrations/001_glatko_foundation.sql:257-271`](supabase/migrations/001_glatko_foundation.sql) — pro'ların hazır paketleri (örn. "tek odalı temel temizlik €30"). `category_id` **nullable**, FK var ama `idx` yok.

### 1.5 i18n stratejisi (DB tarafı)

**Tek strateji:** Aynı satırda `JSONB` kolonlar. Ayrı `category_translations` tablosu **yok**.

[`supabase/migrations/001_glatko_foundation.sql:474-481`](supabase/migrations/001_glatko_foundation.sql) örneği:

```sql
INSERT INTO glatko_service_categories (slug, name, description, icon, sort_order) VALUES
('home-services',
 '{"tr":"Ev Temizlik & Tadilat","en":"Home Cleaning & Renovation","de":"Hausreinigung & Renovierung","it":"Pulizia Casa & Ristrutturazione","ru":"Уборка и ремонт дома","uk":"Прибирання та ремонт дому","sr":"Čišćenje i renoviranje kuće","me":"Čišćenje i renoviranje kuće","ar":"تنظيف المنزل والتجديد"}',
 '{"tr":"Villa temizliği, derin temizlik, boya-badana, elektrik, tesisat", ...}',
 'home', 1),
```

**TS karşılığı** — [`types/glatko.ts:1-15`](types/glatko.ts):

```ts
export type MultiLangText = Partial<Record<Locale, string>>;

export interface ServiceCategory {
  id: string;
  parent_id: string | null;
  slug: string;
  name: MultiLangText;          // JSONB → TS objesi
  description: MultiLangText | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  children?: ServiceCategory[];  // runtime-only
}
```

Tüm 21 kategorinin **9 dilde de adı dolu** (seed migration'ında her dile karşılık string mevcut).

### 1.6 Mevcut kayıt envanteri (seed bazlı)

**Toplam: 21 satır** (2 root + 11 ev-altı + 8 tekne-altı). Live DB sayımı yapılmadı (read-only kuralı), ama seed dışında dinamik olarak kategori oluşturan kod yolu da yok.

#### Root kategoriler

| slug | icon | sort | name (tr / en / me) |
|---|---|---|---|
| `home-services` | `home` | 1 | Ev Temizlik & Tadilat / Home Cleaning & Renovation / Čišćenje i renoviranje kuće |
| `boat-services` | `anchor` | 2 | Tekne Hizmetleri / Boat Services / Servisi za čamce |

#### `home-services` altı (11 alt-kategori)

| slug | icon | sort | tr | en |
|---|---|---|---|---|
| `general-cleaning` | sparkles | 1 | Genel Temizlik | General Cleaning |
| `deep-cleaning` | sparkles | 2 | Derin Temizlik | Deep Cleaning |
| `villa-airbnb` | home | 3 | Villa / Airbnb Temizliği | Villa / Airbnb Cleaning |
| `renovation` | hammer | 4 | Tadilat & Renovasyon | Renovation & Remodeling |
| `painting` | paintbrush | 5 | Boya-Badana | Painting & Decoration |
| `electrical` | zap | 6 | Elektrik Tesisatı | Electrical Services |
| `plumbing` | droplets | 7 | Su Tesisatı | Plumbing |
| `ac-heating` | thermometer | 8 | Klima & Isıtma | AC & Heating |
| `furniture-assembly` | sofa | 9 | Mobilya Montajı | Furniture Assembly |
| `garden` | trees | 10 | Bahçe Bakımı | Garden Maintenance |
| `pool` | waves | 11 | Havuz Temizliği | Pool Cleaning |

#### `boat-services` altı (8 alt-kategori)

| slug | icon | sort | tr | en |
|---|---|---|---|---|
| `captain-hire` | user | 1 | Kaptan Kiralama | Captain Hire |
| `antifouling` | shield | 2 | Antifouling | Antifouling |
| `engine-service` | settings | 3 | Motor Servis | Engine Service |
| `hull-cleaning` | brush | 4 | Gövde Temizlik & Polisaj | Hull Cleaning & Polishing |
| `winterization` | snowflake | 5 | Kışlama | Winterization |
| `charter-prep` | clipboard | 6 | Charter Hazırlık | Charter Preparation |
| `emergency-repair` | alert-triangle | 7 | Acil Onarım | Emergency Repair |
| `haul-out` | truck | 8 | Karaya Çıkarma & Transport | Haul Out & Transport |

> **Eksik vertical'lar:** Beauty/wellness, otomotiv, IT/tech, eğitim/özel ders, etkinlik/organizasyon, yemek/catering, evcil hayvan, taşıma, kargo, danışmanlık. Mevcut envanter çok dar bir "ev + tekne" odaklı niş.

### 1.7 İlk 20 satır CSV (seed bazlı)

```csv
slug,parent,icon,sort_order,name_tr,name_en
home-services,,home,1,Ev Temizlik & Tadilat,Home Cleaning & Renovation
boat-services,,anchor,2,Tekne Hizmetleri,Boat Services
general-cleaning,home-services,sparkles,1,Genel Temizlik,General Cleaning
deep-cleaning,home-services,sparkles,2,Derin Temizlik,Deep Cleaning
villa-airbnb,home-services,home,3,Villa / Airbnb Temizliği,Villa / Airbnb Cleaning
renovation,home-services,hammer,4,Tadilat & Renovasyon,Renovation & Remodeling
painting,home-services,paintbrush,5,Boya-Badana,Painting & Decoration
electrical,home-services,zap,6,Elektrik Tesisatı,Electrical Services
plumbing,home-services,droplets,7,Su Tesisatı,Plumbing
ac-heating,home-services,thermometer,8,Klima & Isıtma,AC & Heating
furniture-assembly,home-services,sofa,9,Mobilya Montajı,Furniture Assembly
garden,home-services,trees,10,Bahçe Bakımı,Garden Maintenance
pool,home-services,waves,11,Havuz Temizliği,Pool Cleaning
captain-hire,boat-services,user,1,Kaptan Kiralama,Captain Hire
antifouling,boat-services,shield,2,Antifouling,Antifouling
engine-service,boat-services,settings,3,Motor Servis,Engine Service
hull-cleaning,boat-services,brush,4,Gövde Temizlik & Polisaj,Hull Cleaning & Polishing
winterization,boat-services,snowflake,5,Kışlama,Winterization
charter-prep,boat-services,clipboard,6,Charter Hazırlık,Charter Preparation
emergency-repair,boat-services,alert-triangle,7,Acil Onarım,Emergency Repair
```

(21. satır: `haul-out`)

---

## 2. Frontend — Kategori Gösterim Noktaları

### 2.1 Ana sayfada kategori gösterimi

[`app/[locale]/page.tsx`](app/[locale]/page.tsx) → `LandingPageClient` render eder.

[`app/[locale]/landing-page-client.tsx:206-274`](app/[locale]/landing-page-client.tsx) — kategori section'ı.

**Önemli:** Ana sayfadaki kategori kartları **DB'den çekilmiyor** — sadece 2 kart (`home-services` ve `boat-services`) `SpotlightCard` ile elle yazılmış. Subcategory adları da `dictionaries/*.json` içinden `categories.home.*` keyleri ile alınıyor (bkz. §1.5 ve §7.2).

```tsx
// landing-page-client.tsx:218-243 (yaklaşık)
<SpotlightCard>
  <Home className="..." />
  <h3>{t("categories.home.title")}</h3>
  <p>{t("categories.home.description")}</p>
  {/* Hardcoded chip listesi */}
  {["generalCleaning","deepCleaning","villaAirbnb","renovation","painting","electrical"]
    .map(k => <Chip>{t(`categories.home.${k}`)}</Chip>)}
  <Link href={`/${locale}/services/home-services`}>...</Link>
</SpotlightCard>
```

### 2.2 Adanmış sayfa rotaları

| Route | Tip | Detay |
|---|---|---|
| [`app/[locale]/services/page.tsx`](app/[locale]/services/page.tsx) | Server, ISR (`revalidate=3600`) | Tab'lı genel hub: home / boat tab'ları, alt-kategori chip'leri |
| [`app/[locale]/services/[slug]/page.tsx`](app/[locale]/services/[slug]/page.tsx) | Server, ISR | Tek kategori detayı: `getCategoryWithStats(slug)` ile DB'den çeker, top 6 pro listesi |
| [`app/[locale]/providers/page.tsx`](app/[locale]/providers/page.tsx) | Client | `?category=<slug>` query param ile filtreleme |

**Slug formatı:** Tüm locale'lerde aynı İngilizce slug — `/me/services/general-cleaning`, `/tr/services/general-cleaning`, vb. Locale-translated slug **yok** (örn. `/me/usluga/ciscenje` mevcut değil).

`/kategoriler/`, `/kategorije/`, `/usluge/`, `/usluga/[slug]/` gibi locale-native rotalar **yok**.

### 2.3 Aceternity envanteri

`components/aceternity/` — **6 dosya:**

| Dosya | Export | Kullanım sayısı | Not |
|---|---|---|---|
| [`background-grids.tsx`](components/aceternity/background-grids.tsx) | `BackgroundGrids` | 2 | PageBackground + ProDashboardShell |
| [`collision-beam.tsx`](components/aceternity/collision-beam.tsx) | `CollisionMechanism` | 3 | Landing'de 3x |
| [`featured-images.tsx`](components/aceternity/featured-images.tsx) | `CtaFeaturedImages` | **0** | **KULLANILMIYOR** |
| [`hero-background.tsx`](components/aceternity/hero-background.tsx) | `AceternityHeroBackground` | 1 | Landing hero |
| [`lines-gradient.tsx`](components/aceternity/lines-gradient.tsx) | `LinesGradient` | 1 | Landing |
| [`spotlight-effect.tsx`](components/aceternity/spotlight-effect.tsx) | `SpotlightRadialLayers` | 2 | SpotlightCard, GlassmorphCard |

**Şu anda kategori kartlarında kullanılan:** `SpotlightCard` (wraps `SpotlightRadialLayers`) — basit hover-glow. Bento, 3D-tilt, animated-tooltip, lens, evervault, infinite-moving-cards vs. **kullanılmıyor — çünkü repo'da hiç yok.**

**Aceternity flag check (yok olanlar):**

`bento-grid`, `card-hover-effect`, `3d-card`, `animated-tooltip`, `focus-cards`, `hover-effect`, `glowing-stars`, `background-beams`, `spotlight` (orijinal versiyonu yok ama `spotlight-effect.tsx` muhtemelen kendi adaptasyon), `lens`, `evervault-card`, `infinite-moving-cards`, `wobble-card`, `sticky-scroll-reveal`, `draggable-card-container`, `lamp-effect`, `tracing-beam` — **hiçbiri repo'da yok**.

> **Kategori kartı için kullanılabilir candidate'lar (yüklemek lazım):** `bento-grid` (premium grid layout), `card-hover-effect` (Apple-tarzı zoom), `3d-card` (perspective tilt), `focus-cards` (defocus diğerlerini), `lens` (görsel detay büyütme), `wobble-card` (mouse-tracking eğim).

### 2.4 Tek kategori kartı bileşeni — `SpotlightCard`

[`components/landing/spotlight-card.tsx:14-49`](components/landing/spotlight-card.tsx)

```tsx
export function SpotlightCard({ children, className }) {
  // mouse-tracked position state
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm",
        "border-gray-200 bg-white shadow-lg hover:shadow-xl",
        "dark:border-white/10 dark:bg-white/5",
        "hover:border-teal-500/45 dark:hover:border-teal-500/35"
      )}
    >
      <SpotlightRadialLayers position={position} isHovered={isHovered} reduced={reduced} />
      <div className="relative z-10 p-8">{children}</div>
    </motion.div>
  );
}
```

Hover etkisi: 4px yukarı sıçrama + cursor-takipli teal radial glow + border rengi geçişi. **Görsel ya da resim slot'u yok** — sadece çocuk olarak verilen ikonu render ediyor.

### 2.5 Pro profil sayfasında kategori gösterimi

[`app/[locale]/provider/[id]/page.tsx:284-333`](app/[locale]/provider/[id]/page.tsx) — "Services" section.

- Pro'nun `glatko_pro_services` join'inden gelen kategoriler liste halinde
- İlk eleman = "Primary" badge'i alır (sol kenarda teal border)
- Her kart: Briefcase icon + kategori adı + (varsa) `custom_rate_min – custom_rate_max`
- Hiç kategori görseli kullanılmıyor

### 2.6 Pro onboarding (become-a-pro) kategori seçici

[`app/[locale]/become-a-pro/page.tsx`](app/[locale]/become-a-pro/page.tsx) → [`components/glatko/become-a-pro/StepServiceAreas.tsx:39-156`](components/glatko/become-a-pro/StepServiceAreas.tsx)

- Parent kategoriler 2-kolon grid'inde `SpotlightCard` ile
- Tıklayınca `AnimatePresence` ile alt-kategoriler açılır (accordion)
- Alt-kategoriler basit checkbox + label
- Seçilenler arasından radio button ile "primary" seçilir

> **Search/filter yok**, **autocomplete yok** — sadece accordion. 50+ kategoriye genişlersek kullanılamaz hâle gelir.

---

## 3. Mevcut Görünüm

### 3.1 Şu anda gösterilen kategori sayısı

- **Ana sayfa:** 2 kart (sadece root'lar) + her birinde 6 hardcoded chip
- **`/services` (hub):** 2 tab (home/boat) + tıklanınca 11 veya 8 chip
- **`/services/[slug]`:** Tek kategori detayı (DB'den dinamik)
- **`/providers` filter dropdown:** Hardcoded subset slug listesi

### 3.2 Kategori başına alt-kategori durumu

Tüm 21 kategoriden **2 tanesi** parent (`home-services`, `boat-services`) — her ikisinin alt-kategorileri var. Geriye kalan 19 kategorinin **çocuğu yok** (yalnızca yaprak).

### 3.3 Ekran görüntüleri

> **Manuel screenshot gerekli.** Playwright kurulu değil (`package.json` içinde dependency yok), MCP ile preview de aktif değil.
>
> Manuel olarak çekilmesi gereken viewport'lar:
> - Desktop 1440×900: `https://glatko.app/me` (ana sayfa kategori section'ı)
> - Desktop 1440×900: `https://glatko.app/me/services` (hub)
> - Desktop 1440×900: `https://glatko.app/me/services/general-cleaning` (detay)
> - Mobile 375×812: aynı 3 sayfanın mobile karşılıkları
>
> Çıktı yolu: `docs/audit/screenshots/`

---

## 4. Wizard / Soru Sistemi

### 4.1 Talep oluşturma wizard'ı

**Konum:** [`components/glatko/request-service/`](components/glatko/request-service/)

**Ana orchestrator:** [`RequestServiceWizard.tsx:43-48`](components/glatko/request-service/RequestServiceWizard.tsx) — 4 adımlı stepper.

```tsx
const STEPS = [
  { icon: Layers,   key: "category" },  // 0: Kategori seçimi
  { icon: FileText, key: "details" },   // 1: Kategoriye özel sorular
  { icon: MapPin,   key: "location" },  // 2: Adres / şehir / aciliyet
  { icon: Camera,   key: "photos" },    // 3: Fotoğraf + iletişim
] as const;
```

### 4.2 Per-kategori sorular **var mı?**

**EVET — ama TAMAMEN HARDCODED.** [`StepDetails.tsx:155-184`](components/glatko/request-service/StepDetails.tsx) içinde slug'a göre `if/else`:

```ts
const CLEANING_SLUGS  = ["general-cleaning", "deep-cleaning", "villa-airbnb"];
const RENOVATION_SLUGS = ["renovation", "painting"];
const TECHNICAL_SLUGS  = ["electrical", "plumbing", "ac-heating"];
const SIMPLE_SLUGS     = ["furniture-assembly", "garden", "pool"];

const isCleaning   = CLEANING_SLUGS.includes(selectedSubSlug);
const isRenovation = RENOVATION_SLUGS.includes(selectedSubSlug);
const isTechnical  = TECHNICAL_SLUGS.includes(selectedSubSlug);
// + Boat alt-grupları
```

### 4.3 Soru tipleri ve örnekler

| Kategori grubu | Sorulan alanlar | Input tipi |
|---|---|---|
| Cleaning | propertyType (apartment/house/villa/office), rooms, areaRange, frequency, notes | chip-select, stepper (+/-), select, select, textarea |
| Renovation | jobTypes (multi: interior/exterior/full/partial/wall-paint/ceiling-paint), areaRange, notes | multi-chip, select, textarea |
| Technical | issueType (repair/installation/inspection/replacement), isUrgent, notes | chip-select, toggle, textarea |
| Simple | description, notes | textarea, textarea |
| Captain Hire | boatType, boatLength, tripDuration, hasLicense | select, number, select, toggle |
| Boat maintenance | boatType, boatLength, engineType, notes | select, number, select, textarea |
| Boat logistics | boatType, boatLength, marina, notes | select, number, select, textarea |
| Emergency | description (zorunlu) | textarea |
| Diğer | description (fallback) | textarea |

### 4.4 Soruların kayıt formatı

[`RequestServiceWizard.tsx:230-273`](components/glatko/request-service/RequestServiceWizard.tsx):

```ts
fd.set("details", JSON.stringify(details));
// → glatko_service_requests.details JSONB kolonuna gider
```

DB'de `details` `JSONB DEFAULT '{}'` — yani şema kontrolü yok, frontend ne basarsa o gider.

### 4.5 Eksiklikler

- **Kategoriye özel sorular DB'de saklanmıyor** → admin panelinden yeni soru eklenemiyor.
- **Validation şemaları kategori-özel değil** → `details` herhangi bir şekilde olabilir, server validate etmiyor.
- **Yeni kategori eklendiğinde** soru eklemek için TS kodu güncellenmeli + redeploy.

---

## 5. Arama Altyapısı

### 5.1 Backend search teknolojisi

Repo geneli grep:

| Pattern | Bulundu mu? |
|---|---|
| `ilike`, `ILIKE` | **HAYIR** (Supabase JS SDK üzerinden de kullanılmıyor) |
| `tsvector`, `to_tsquery`, `plainto_tsquery` | **HAYIR** |
| `pg_trgm` | **HAYIR** |
| `algolia`, `meilisearch`, `typesense` | **HAYIR** |
| `fuse.js`, `flexsearch` | **HAYIR** |

**Tek kullanılan teknik:** Tüm aktif kategori satırlarını çek, JS'te `String.prototype.includes()` ile filtre.

[`lib/supabase/glatko.server.ts:1461-1498`](lib/supabase/glatko.server.ts) — `getSearchSuggestions()`:

```ts
const { data: categories } = await supabase
  .from("glatko_service_categories")
  .select("slug, name")
  .eq("is_active", true);

for (const cat of categories) {
  const name = cat.name?.[locale] || cat.name?.["en"] || "";
  if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
    results.push({ type: "category", label: name, slug: cat.slug });
  }
}
```

### 5.2 Header'da arama kutusu var mı?

**Hayır.** [`components/glatko/landing/`](components/glatko/landing/) ve `GlatkoHeader` içinde search input yok. Search bar sadece [`/providers`](app/[locale]/providers/page.tsx) sayfasında ve `SearchBar` componenti olarak [`components/glatko/search/SearchBar.tsx`](components/glatko/search/SearchBar.tsx) içinde.

### 5.3 Autocomplete davranışı

- 300ms debounce ([`SearchBar.tsx:50-54`](components/glatko/search/SearchBar.tsx))
- Dropdown with `AnimatePresence` (kategori + pro karışık, max 8 sonuç)
- Submit on Enter → `/providers?q=<query>` rotasına gider (sayfa reload)

### 5.4 Synonym / keyword mapping

**YOK.** "Ev temizliği" yazılırsa "general-cleaning" bulunur (çünkü `name` JSONB'de "Genel Temizlik" yazıyor). Ama "halı yıkama", "cam silme", "bulaşık", "kuaför", "manikür" gibi sorgular hiçbir sonuç döndürmez — DB'de bu terimler hiçbir yerde yok.

### 5.5 Performans riski

`select * from glatko_service_categories where is_active=true` her arama key-stroke'da çağrılıyor (debounce sonrası). 21 satır için kabul edilebilir, ama 200+ kategoriye çıkıldığında her sorguda tüm tabloyu çekmek savurganlık olur — server-side `ilike` filtresine geçiş şart.

---

## 6. Görseller

### 6.1 Kategori görseli mevcut mu?

**Hayır.** [`public/`](public/) içeriği:

```
apple-icon.svg          (202 B)
apple-touch-icon.png    (11 B — bozuk veya placeholder)
favicon.svg             (195 B)
icon.svg                (195 B)
noise.webp              (732 KB — texture overlay)
```

`public/categories/`, `public/images/categories/`, `public/services/` **klasörleri mevcut değil**.

Supabase Storage'da `categories` bucket'ı mevcut değil (mevcut bucket'lar: `avatars`, `glatko-request-photos`).

### 6.2 Kategori için ne kullanılıyor?

**Sadece lucide-react ikonları.** Her kategorinin DB'de `icon TEXT` kolonu var (örn. `home`, `anchor`, `sparkles`, `hammer`, `paintbrush`), ama bu lucide adı string'i — gerçek görsel değil.

[`StepCategory.tsx:19-22`](components/glatko/request-service/StepCategory.tsx):

```ts
const PARENT_ICONS: Record<string, typeof Home> = {
  "home-services": Home,
  "boat-services": Anchor,
};
```

Kart görseli, kapak fotoğrafı, illustrative graphic, mood image — **hiçbiri yok**.

### 6.3 next/image kullanımı

[`next.config.mjs:8-12`](next.config.mjs):

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "fqeikivvnqagbwkxsdjk.supabase.co" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
},
```

- Kategori görseli olmadığı için `next/image` kategoriler için kullanılmıyor.
- Talep fotoğrafı yüklemesinde ([`StepPhotos.tsx`](components/glatko/request-service/StepPhotos.tsx)) `next/image` `unoptimized` flag'i ile kullanılıyor.
- Avatarlarda `next/image` kullanılıyor.

### 6.4 Sonuç

Görsel yatırımı = **0**. Premium marketplace görüntüsü için en büyük açıklardan biri.

---

## 7. i18n + SEO

### 7.1 Locale konfigürasyonu

[`i18n/routing.ts`](i18n/routing.ts):

```ts
export const locales = ['tr', 'en', 'de', 'it', 'ru', 'uk', 'sr', 'me', 'ar'] as const;
export const defaultLocale: Locale = 'tr';
export const routing = defineRouting({ locales, defaultLocale, localePrefix: 'always' });
```

> **Not:** Default locale `tr` ama ana pazar Karadağ (Crna Gora). Bu büyük olasılıkla erken-fazda kalmış bir karar — Karadağ'da `me` veya `sr` default olmalı (SEO + UX açısından).

### 7.2 Dictionary dosyaları

[`dictionaries/`](dictionaries/) — 9 dosya:

| Dosya | Boyut | Notlar |
|---|---|---|
| `ar.json` | 61.7 KB | En büyük (Arapça karakterler) |
| `de.json` | 54.3 KB | |
| `en.json` | 53.3 KB | |
| `it.json` | 53.8 KB | |
| `me.json` | **51.7 KB (en küçük)** | İçerik gözle bakıldığında tam — boyut farkı dilden |
| `ru.json` | 70.2 KB | |
| `sr.json` | 54.4 KB | |
| `tr.json` | 55.8 KB | |
| `uk.json` | 69.7 KB | |

`request.step2.*` altında 64 anahtar — **9 locale'in 9'unda da aynı sayıda key var**, gözlemlenebilir bir gap yok.

`categories.*` altında: `categories.home.*` ve `categories.boat.*` blokları 9 locale'de mevcut.

> **Hibrit i18n:** Kategori adları **iki yerde**:
> 1. DB'de `glatko_service_categories.name` (JSONB)
> 2. `dictionaries/<locale>.json` `categories.home.*` keylerinde
>
> Bu **kaynak gerçek (source-of-truth) belirsizliği**: ana sayfa kart başlığı dictionary'den, detay sayfa başlığı DB'den geliyor. Aynı string için iki farklı yazımı olabilir, bug üretir.

### 7.3 SEO meta

[`app/[locale]/layout.tsx:37-66`](app/[locale]/layout.tsx) — `generateMetadata`:

- `metadataBase: https://glatko.app`
- `title.template: "%s | Glatko"`
- `alternates.canonical: /${locale}`
- OpenGraph: title, description, url, locale, type=website
- Twitter: summary_large_image
- robots: index+follow

[`app/[locale]/services/page.tsx:14-31`](app/[locale]/services/page.tsx) — services hub'ı için custom meta. Ama [`app/[locale]/services/[slug]/page.tsx`](app/[locale]/services/[slug]/page.tsx) içinde **`generateMetadata` yok** → her kategori detay sayfası layout'tan gelen jenerik meta'yı kullanıyor.

### 7.4 Structured data (JSON-LD)

| Schema tipi | Var mı? | Konum |
|---|---|---|
| `LocalBusiness` | EVET | [`components/seo/LocalBusinessSchema.tsx`](components/seo/LocalBusinessSchema.tsx) — sadece pro profilinde |
| `BreadcrumbList` | **HAYIR** |  |
| `Service` | **HAYIR** |  |
| `ItemList` (kategori listesi) | **HAYIR** |  |
| `AggregateOffer` | **HAYIR** |  |
| `WebSite` + `SearchAction` | **HAYIR** |  |
| `FAQPage` | **HAYIR** |  |

### 7.5 OG image

[`app/opengraph-image.tsx`](app/opengraph-image.tsx) — `runtime = "edge"`, **statik branded image**. Per-kategori dynamic OG image **YOK**. (örn. `/services/general-cleaning` için kategori adı + ikonu içeren özelleşmiş OG görseli oluşturulmuyor.)

### 7.6 Sitemap & robots

[`app/sitemap.ts:33-86`](app/sitemap.ts) — kategori URL'leri içeride:

```ts
const categorySlugs = ["home-services", "boat-services", "general-cleaning", ...];
for (const slug of categorySlugs)
  for (const locale of LOCALES)
    routes.push({
      url: `${BASE}/${locale}/services/${slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: makeAlternates(`/services/${slug}`) },
    });
```

→ 9 locale × 21 slug = **189 kategori URL'si** sitemap'te.

[`app/robots.ts`](app/robots.ts) — public alanlar açık, `/admin/`, `/dashboard/`, `/api/` disallow.

### 7.7 Slug yapısı

Pattern: `/{locale}/services/{slug}` — slug **tüm locale'lerde aynı (İngilizce)**.

- ✅ Avantaj: Tek pattern, sitemap basit
- ❌ Dezavantaj: Karadağca SEO açısından "ciscenje-kuca" tarzı yerel slug'lar daha iyi rank alır
- Slugify fonksiyonu repo'da **yok** — slug'lar manuel olarak migration'a yazılmış

---

## 8. Tespit Edilen Boşluklar (Gap Analysis)

> Premium hizmet marketplace görünümü için eksikler — öncelik sırasıyla.

### Kritik (P0 — launch'tan önce gerekli)

1. **Kategori görselleri sıfır** — sektör standardı her kategoride bir illustrative image / kapak fotoğrafı (Thumbtack, Bark, TaskRabbit). Sadece lucide ikon premium hissetmiyor.
2. **Ana sayfa sadece 2 root kart gösteriyor** — kullanıcı 11 alt-kategoriyi görmeden tıklamak zorunda. Birinci impression "küçük marketplace" hissini veriyor.
3. **Search synonym/intent yok** — "halı temizliği", "cam silme", "ev tamir" tarzı doğal sorgular boş döndürüyor.
4. **Header'da search yok** — arama keşfedilebilirliği `/providers` sayfasına gizlenmiş.
5. **Per-kategori dynamic OG image yok** — sosyal paylaşımlarda her kategori aynı brand görseli alıyor.

### Yüksek (P1 — ilk büyüme sprintinde)

6. **Hibrit i18n (DB + dictionary)** — aynı string iki yerde, source-of-truth muğlak. Bir tarafa konsolide edilmeli.
7. **Per-kategori soru setleri hardcoded TS** — admin panel ile yönetilemiyor; yeni kategori soru seti = redeploy.
8. **Kategori detay sayfasında `generateMetadata` yok** — title/description default'a düşüyor, SEO etkisi azalıyor.
9. **`BreadcrumbList` JSON-LD yok** — Google rich-result kaybı.
10. **Kategori envanteri çok dar (sadece ev + tekne)** — Beauty, IT, eğitim, taşıma, etkinlik vertikalleri eksik.
11. **Pro onboarding'de kategori seçici accordion** — 50+ kategoride scaling olmaz; search + arama önerileri lazım.

### Orta (P2)

12. **Hiyerarşi 2 seviyeli** — 3+ seviye için (örn. *Tekne > Motor > Dizel servis*) ya migration ya da JSONB yapı değişikliği gerekir.
13. **Default locale `tr` ama hedef pazar Karadağ** — `me` default olmalı (SEO + ana sayfa).
14. **Talep tablosunda `category_id` nullable** — istenmeyen esneklik, NOT NULL'a çekilmeli.
15. **Multi-category talep yok** — bazı işler iki kategoriye giriyor (örn. "boya + tadilat") — junction tablosu opsiyonu düşünülmeli.
16. **Search backend tüm satırı çekiyor** — kategori tablosu büyürse `ilike` server-side'a alınmalı.

### Düşük / nice-to-have

17. **Aceternity premium component'leri yok** — bento-grid, 3d-card, lens, focus-cards gibi kategori vitrini için harika opsiyonlar repo'ya yüklenmemiş.
18. **Kategori detay sayfasında "ilgili kategoriler" carousel'i yok**.
19. **Kategori başına FAQ section'ı yok** (hem UX hem `FAQPage` schema için fırsat).
20. **`updated_at` kolonu kategoride yok** — değişiklik takibi imkânsız.

---

## 9. Önerilen Migration Adımları (sadece tahmin — uygulama YAPILMADI)

> Aşağıdaki adımlar **öneri**, tek bir SQL komutu çalıştırılmadı. Karar verildikten sonra ayrı bir sprint olarak ele alınmalı.

### Adım 1 — DB şemasını zenginleştir (1 yeni migration)

`supabase/migrations/010_categories_enrichment.sql` (öneri):

```sql
-- Kapak görseli, vitrin görseli, premium meta
ALTER TABLE glatko_service_categories
  ADD COLUMN cover_image_url TEXT,
  ADD COLUMN hero_image_url TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN seo_title JSONB,
  ADD COLUMN seo_description JSONB,
  ADD COLUMN keywords TEXT[],          -- synonym/arama desteği
  ADD COLUMN faq JSONB DEFAULT '[]',   -- per-locale FAQ
  ADD COLUMN avg_price_min DECIMAL(10,2),
  ADD COLUMN avg_price_max DECIMAL(10,2);

-- Sorular için ayrı tablo (admin yönetilebilir)
CREATE TABLE glatko_category_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES glatko_service_categories(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,            -- "rooms", "areaRange"
  field_type TEXT NOT NULL CHECK (field_type IN ('select','multi','number','text','toggle','stepper','image')),
  is_required BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  options JSONB,                      -- select seçenekleri (multi-lang)
  label JSONB NOT NULL,               -- {tr,en,me,...}
  hint  JSONB
);

-- Synonyms / arama anahtarları
CREATE TABLE glatko_category_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES glatko_service_categories(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  term TEXT NOT NULL
);
CREATE INDEX ON glatko_category_synonyms (locale, term);

-- pg_trgm ile fuzzy arama
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_gsc_name_trgm ON glatko_service_categories USING gin (name gin_trgm_ops);

-- updated_at trigger
CREATE TRIGGER trg_gsc_updated
  BEFORE UPDATE ON glatko_service_categories
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

**Tahmini effort:** S (1-2 gün — migration yazma + RLS + test).

### Adım 2 — Görsel content sprint

- 21 kategori için 1280×720 cover + 1920×640 hero görseli üret
- Storage'a `category-images` bucket'ı oluştur
- DB'ye URL'leri seed et
- Tüm kart component'lerini `<Image>` ile entegre et

**Tahmini effort:** M (görsel üretim ve revize sürecine bağlı, kabaca 1-2 hafta).

### Adım 3 — Frontend yenileme

- Ana sayfa: 2 kart → "bento grid" tarzı 6-8 kart (en popüler kategoriler) + "Tümünü gör" linki
- `/services` hub: tab yerine grid + filtre + arama
- `SearchBar` header'a taşı + autocomplete
- Aceternity premium component'leri yükle (`bento-grid`, `card-hover-effect`, `3d-card`, `lens`)
- Kategori detayda dynamic OG image (`opengraph-image.tsx` per-route)

**Tahmini effort:** L (1-2 hafta — UI yeniden yazımı + a11y + responsive testleri).

### Adım 4 — Soruları DB'ye taşı + admin paneli

- `StepDetails.tsx` `if/else` zincirini sil, `glatko_category_questions` tablosundan dinamik form üret
- Admin panele "kategori sorusu ekle/düzenle" UI'ı ekle
- Server-side per-question Zod validation jeneratörü

**Tahmini effort:** L (1-2 hafta — form jeneratörü + admin UI + migration).

### Adım 5 — Search yenileme

- `pg_trgm` index üzerinden server-side fuzzy search
- Synonym tablosunu sorguya dahil et
- Autocomplete debounce server-action'a çek
- Telemetry: hangi sorgular boş dönüyor → eksik kategori/synonym

**Tahmini effort:** M (~1 hafta).

### Adım 6 — Vertikal genişleme

Yeni vertikaller (kabaca):

```
+ beauty-wellness (kuaför, manikür, masaj, makyaj, saç-bakım)
+ automotive       (oto-tamir, lastik, oto-yıkama, çekici)
+ tech-it          (bilgisayar tamiri, ağ kurulumu, web tasarım)
+ education        (özel ders, dil, müzik, sürücü kursu)
+ events           (DJ, fotoğrafçı, organizasyon, catering)
+ pets             (veteriner, gezdirme, eğitim, pansiyon)
+ moving           (nakliye, depolama, paketleme)
+ wellness-fitness (kişisel antrenör, yoga, beslenme)
+ legal-finance    (avukat, muhasebe, danışmanlık)
```

**Tahmini effort:** XL (3-4 hafta — sadece DB seed değil, her vertikal için kategori-spesifik soru setleri + içerik + görsel).

### Toplam tahmini sprint büyüklüğü

**XL** (4-6 hafta tam-zamanlı tek geliştirici, content + tasarım hariç). Sadece "premium görünüm" hedefi (Adım 1-3) için **L** (~2 hafta).

---

## 10. Ek Notlar

- **Ne yapılmadı:** Live DB'ye sorgu atılmadı, build çalıştırılmadı, dosyalar değiştirilmedi, commit yapılmadı, screenshot çekilmedi.
- **Ne yapıldı:** 100% read-only kod taraması (grep + cat + read), 9 migration dosyasının full okuması, frontend route taraması, `dictionaries/*.json` ve `i18n/` konfigürasyonu kontrolü, `package.json` dependency analizi.
- **Audit guvenirlik notu:** Tüm bulgular kaynak kod referanslıdır (`file:line`); spekülasyon "tespit edilemedi" veya "öneri" olarak ayrı işaretlenmiştir.

---

**Audit hazırlayıcı:** Claude Opus 4.7 (1M context)
**Süre:** ~5 dakika (3 paralel Explore agent)
**Çıktı boyutu:** ~600 satır markdown
