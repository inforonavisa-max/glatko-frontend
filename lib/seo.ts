export const SEO_LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
export const SEO_BASE = "https://glatko.app";

/** BCP 47 hreflang; disambiguate sr (Serbia) vs me (Montenegro path segment). */
export function hreflangForLocale(locale: string): string {
  if (locale === "me") return "sr-ME";
  if (locale === "sr") return "sr-RS";
  return locale;
}

/**
 * Build canonical + hreflang languages map for a given path. The path should
 * be the locale-less suffix (e.g. "/become-a-pro", "/services/boat-services",
 * or "" for the locale homepage). Returns the shape Next expects on
 * `metadata.alternates`.
 */
export function buildAlternates(locale: string, pathSuffix: string) {
  const cleanPath = pathSuffix.startsWith("/") || pathSuffix === ""
    ? pathSuffix
    : `/${pathSuffix}`;
  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) {
    languages[hreflangForLocale(l)] = `${SEO_BASE}/${l}${cleanPath}`;
  }
  languages["x-default"] = `${SEO_BASE}/en${cleanPath}`;
  return {
    canonical: `${SEO_BASE}/${locale}${cleanPath}`,
    languages,
  };
}
