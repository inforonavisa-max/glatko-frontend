const LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
const BASE = "https://glatko.app";

export function getAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE}/${locale}${path}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}${path}`])),
      "x-default": `${BASE}/en${path}`,
    },
  };
}
