# Glatko Sağlık — Carve-out (Extraction) Checklist

> **Amaç:** "Glatko Sağlık" alt-markası bugün Glatko monorepo'su + tek Supabase
> projesi içinde yaşıyor (Getir modeli: önce isim + modülerlik, altyapı ayrımı
> sonra). Bu doküman, ileride sağlık dikeyini **ayrı bir ürün/şirket/domain'e
> taşımak gerekirse** (satış, ortaklık, ayrı tüzel kişilik) hangi bağların
> kesileceğini ve hangi şeylerin zaten izole olduğunu sayar.
>
> **Bugün hiçbir şey ayrılmıyor.** Bu yalnız bir hazırlık haritasıdır; her H-sprint
> sonunda "yeni bağ ekledim mi?" diye buraya bakılır. Tarih: 2026-06-15 (H0 sub-brand).

---

## 1. NELER ZATEN İZOLE (ayırma maliyeti düşük)

| Katman | Konum | Not |
|---|---|---|
| **DB şeması** | `health` Postgres şeması (migration 065+) | `public.*` core tablolarından ayrı şema. PostgREST'e expose EDİLMEZ. Tek yazma kapısı SECURITY DEFINER RPC'ler (`public.health_waitlist_join`). |
| **Sağlık modül kodu** | `lib/saglik/`, `components/glatko-saglik/` | Namespace'li. Sağlığa özel her şey burada (flag, path config, formlar). |
| **Renk / marka token'ı** | `tailwind.config.ts` → `brandHealth` grubu | TEK kaynak. Saçılmış sky hex YOK. Carve-out'ta bu grup `primary` olur, gerisi otomatik döner. |
| **Marka kilidi (lockup)** | `components/glatko/verticals/VerticalBrand.tsx` | "Glatko Sağlık" görsel kimliği tek component. Bağımsız markaya geçişte burada wordmark değişir. |
| **Rotalar / path** | `lib/saglik/config.ts` (`HEALTH_ROUTES`, `HEALTH_HOST`) | `/saglik` literal'leri tek sabitte. `HEALTH_HOST` bugün `null` → ayrı subdomain/domain'e geçiş tek dosya değişikliği. |
| **Feature flag** | `HEALTH_VERTICAL_ENABLED` (Vercel env) + `lib/saglik/flags.ts` | Sağlık dikeyini tümden açıp kapatan tek anahtar. |
| **i18n** | `dictionaries/*.json` → `verticals.*`, `healthVertical.*` namespace'leri | Anahtarlar namespace'li; carve-out'ta bu bloklar kopyalanıp taşınır. |

---

## 2. NELER PAYLAŞILIYOR (kesilmesi gereken bağlar)

| Bağ | Bugünkü durum | Carve-out adımı |
|---|---|---|
| **`auth.users`** | Sağlık `providers`/`patients` ileride `auth.users(id)`'e FK verecek (planlı tek izinli core bağ). | Kullanıcı tablolarını yeni projeye **export** + auth migration (Supabase user export / SSO köprüsü). Tek gerçek veri bağı budur — bilinçli. |
| **Supabase projesi** | Aynı proje (`cjqappdfyxgytdyeytwv`), Frankfurt. | Yeni proje aç → `health` şemasını `pg_dump --schema=health` ile taşı → RPC'leri yeniden grant et. Core `public.*`'a FK OLMADIĞI için temiz kopar (auth.users hariç, üstte). |
| **Paylaşılan UI primitive'leri** | `components/ui/*`, `lib/utils` (`cn`), `useReducedMotion`, `next-intl` `Link`/`useTranslations`. | Yeni repo'ya bu primitive'lerin kopyası/paketi. Sağlık kodu yalnız bunlara dokunur (App-spesifik business component'e DEĞİL). |
| **Paylaşılan env / servisler** | Infobip (SMS/WA), Resend, Mapbox, Upstash rate-limit, Sentry. | Yeni hesap/anahtar SETİ veya paylaşımlı anahtarların devri. Hepsi env ile geldiği için kod değişmez. |
| **3-sekme switcher** | `components/glatko/verticals/VerticalsNav.tsx` + `lib/verticals/config.ts` — cross-vertical glue. | Carve-out'ta ana site Glatko'da kalır; switcher'dan sağlık sekmesi ayrı domain'e dış-link olur (`HEALTH_HOST` set edilince). |
| **Middleware guard** | `middleware.ts` H0 bloğu + `lib/verticals/slugs.ts`. | Ayrı domain'e geçişte guard ana repodan kaldırılır; yeni repo kendi flag/guard'ını taşır. |
| **SEO (sitemap/robots/hreflang)** | Launch'a kadar noindex + sitemap dışı (Demir Kural 8). | Carve-out yeni domain'de kendi `sitemap.ts`/`robots.ts`/canonical'ını kurar. |

---

## 3. AYIRMA ADIMLARI (sıra)

1. **Token'ı primary yap.** Yeni repo/tema: `brandHealth` → `primary` (teal yerine sky ana renk olur). `VerticalBrand` wordmark'ı bağımsız markaya güncelle.
2. **DB taşı.** `pg_dump --schema=health` → yeni Supabase projesi; RPC grant'lerini service_role'a yeniden ver; `auth.users` köprüsü (export veya SSO).
3. **Kod paketle.** `lib/saglik/` + `components/glatko-saglik/` + paylaşılan `components/ui` kopyası → yeni repo. `HEALTH_ROUTES` korunur, `HEALTH_HOST` yeni domain.
4. **Domain bağla.** `HEALTH_HOST = "saglik.glatko.app"` (veya bağımsız domain); ana repo switcher'ı dış-link'e çevir; yeni repo'da kendi noindex→index geçişi.
5. **Kullanıcı export.** `auth.users` alt kümesi (sağlık hastaları/provider'ları) yeni projeye; veya merkezi SSO ile iki taraf aynı kimliği paylaşır.
6. **Servis anahtarları.** Infobip/Resend/Mapbox/Upstash/Sentry için yeni anahtar seti veya devir; env-only, kod dokunulmaz.

---

## 4. SÜREKLİ KURAL (her sprintte)

- Sağlık kodu **yalnız** paylaşılan primitive'lere (`components/ui`, `lib/utils`,
  i18n, Supabase client factory'leri) bağlanır — App-spesifik business
  component'lerine (`components/glatko/*` iş/marketplace) ASLA.
- Yeni sağlık tablosu **core `public.*`'a FK vermez** (`auth.users` tek istisna).
- Yeni renk = `brandHealth-*` (saçılmış hex eklenmez).
- Yeni `/saglik` path'i = `HEALTH_ROUTES` üzerinden (literal eklenmez).
- Bu bağlardan biri ihlal edilecekse: önce buraya "yeni paylaşılan bağ" satırı ekle.
