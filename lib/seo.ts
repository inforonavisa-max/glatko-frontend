export const SEO_LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
export const SEO_BASE = "https://glatko.app";

/** BCP 47 hreflang; disambiguate sr (Serbia) vs me (Montenegro path segment). */
export function hreflangForLocale(locale: string): string {
  if (locale === "me") return "sr-ME";
  if (locale === "sr") return "sr-RS";
  return locale;
}
