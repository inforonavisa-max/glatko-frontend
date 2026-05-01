/**
 * Edge-cached font fetcher for next/og ImageResponse.
 *
 * Satori (next/og) ships a single Latin font bundle. Latin + Cyrillic
 * locales (en, tr, de, it, me, sr, ru, uk) render correctly with the
 * default font. Arabic glyphs need a separate Arabic font load — without
 * one Satori produces a 0-byte PNG.
 *
 * The Noto Sans Arabic variable TTF is baked into `public/fonts/` so the
 * Edge runtime can fetch it same-origin with no third-party dependency.
 * The buffer is cached in a per-worker Map; first request pays a single
 * round-trip to the Vercel CDN, every subsequent request hits memory.
 */

const fontCache = new Map<string, ArrayBuffer>();

async function fetchAndCache(
  cacheKey: string,
  url: string,
): Promise<ArrayBuffer> {
  const cached = fontCache.get(cacheKey);
  if (cached) return cached;

  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Font fetch failed (${cacheKey}): ${res.status} ${url}`);
  }
  const buf = await res.arrayBuffer();
  fontCache.set(cacheKey, buf);
  return buf;
}

/**
 * Tajawal Bold (60 KB static) for Arabic OG cards. Two earlier candidates
 * failed:
 *   - NotoSansArabic Variable: blew up Satori's parser
 *     (`Cannot read properties of undefined (reading '256')`).
 *   - NotoSansArabic-Bold static: failed with
 *     `lookupType: 5 - substFormat: 3 is not yet supported` — Satori
 *     can't decode its GSUB advanced contextual substitutions.
 * Tajawal ships a much simpler GSUB table and parses cleanly. Same-origin
 * fetch via VERCEL_URL points at the public/fonts asset on the current
 * deployment.
 */
const TAJAWAL_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/tajawal/Tajawal-Bold.ttf";

export async function getNotoSansArabic(): Promise<ArrayBuffer> {
  return fetchAndCache("tajawal-bold", TAJAWAL_BOLD_URL);
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 700;
  style: "normal";
}

/**
 * Returns the font set ImageResponse needs for a given locale. Latin +
 * Cyrillic locales return [] — Satori's bundled font already covers them.
 * Arabic returns the static Noto Sans Arabic Bold buffer.
 */
export async function getFontsForLocale(locale: string): Promise<OgFont[]> {
  if (locale === "ar") {
    return [
      {
        name: "Noto Sans Arabic",
        data: await getNotoSansArabic(),
        weight: 700,
        style: "normal",
      },
    ];
  }
  return [];
}
