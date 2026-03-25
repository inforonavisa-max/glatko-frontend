const LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
const BASE = "https://glatko.app";

/** BCP 47 hreflang; path segment "me" is not a valid ISO 639-1 language tag. */
function hreflangForLocale(locale: string): string {
  if (locale === "me") return "sr-ME";
  return locale;
}

export function getAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE}/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        LOCALES.map((l) => [hreflangForLocale(l), `${BASE}/${l}${path}`])
      ),
      "x-default": `${BASE}/en${path}`,
    },
  };
}
