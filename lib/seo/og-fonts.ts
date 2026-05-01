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
 * Noto Naskh Arabic variable font, fetched from jsDelivr's GitHub mirror.
 * Same-origin fetch via VERCEL_URL was unreliable (silent 0-byte from
 * Satori on Edge); jsDelivr's CDN is publicly cacheable and stable.
 */
const NOTO_NASKH_ARABIC_URL =
  "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notonaskharabic/NotoNaskhArabic%5Bwght%5D.ttf";

export async function getNotoSansArabic(): Promise<ArrayBuffer> {
  return fetchAndCache("noto-naskh-arabic", NOTO_NASKH_ARABIC_URL);
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

/**
 * Returns the font set ImageResponse needs for a given locale. Latin +
 * Cyrillic locales return [] — Satori's bundled font already covers them.
 *
 * Arabic returns the Noto Naskh Arabic variable font, declared at weight
 * 400 (the variable's default axis). Satori's variable-font handling is
 * unforgiving about non-default weight requests, so we render the Arabic
 * title at fontWeight 400 in the OG handler — visually still bold-enough
 * thanks to the 92px size, and reliable.
 */
export async function getFontsForLocale(locale: string): Promise<OgFont[]> {
  if (locale === "ar") {
    return [
      {
        name: "Noto Sans Arabic",
        data: await getNotoSansArabic(),
        weight: 400,
        style: "normal",
      },
    ];
  }
  return [];
}
