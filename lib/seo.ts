import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const SEO_LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
export const SEO_BASE = "https://glatko.app";

/**
 * BCP 47 hreflang for each locale.
 *   me → sr-Latn-ME (Montenegro, Latin script — matches the URL subtree)
 *   sr → sr-Latn-RS (Serbia, Latin script — matches the URL subtree)
 *
 * The explicit `Latn` script subtag matches what we render in the HTML
 * `<html lang>` attribute and removes ambiguity for Google, which otherwise
 * has to infer script from the region code (Serbian is written in both
 * Cyrillic and Latin).
 */
export function hreflangForLocale(locale: string): string {
  if (locale === "me") return "sr-Latn-ME";
  if (locale === "sr") return "sr-Latn-RS";
  return locale;
}

/**
 * Resolve the locale-specific URL path for a given canonical href via the
 * next-intl `pathnames` map. The returned path already includes the locale
 * prefix (e.g. "/tr/profesyonel-ol"), so callers should NOT prepend the
 * locale a second time.
 */
function localizePath(locale: string, href: string): string {
  // getPathname is typed against the pathnames map; we widen here so callers
  // can pass dynamic strings (e.g. "/services/boat-services") without
  // restructuring everything as `{ pathname, params }` objects.
  return getPathname({
    locale: locale as (typeof routing.locales)[number],
    href: href as Parameters<typeof getPathname>[0]["href"],
  });
}

/**
 * Build canonical + hreflang languages map for a given path. The path should
 * be the locale-less canonical href (e.g. "/become-a-pro", "/services", "/"
 * for the locale homepage). hreflang URLs are resolved through the
 * next-intl pathnames map, so /tr/become-a-pro emits /tr/profesyonel-ol.
 */
export function buildAlternates(locale: string, pathSuffix: string) {
  const canonicalHref =
    pathSuffix === "" || pathSuffix === "/"
      ? "/"
      : pathSuffix.startsWith("/")
        ? pathSuffix
        : `/${pathSuffix}`;

  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) {
    languages[hreflangForLocale(l)] = `${SEO_BASE}${localizePath(l, canonicalHref)}`;
  }
  languages["x-default"] = `${SEO_BASE}${localizePath("en", canonicalHref)}`;

  return {
    canonical: `${SEO_BASE}${localizePath(locale, canonicalHref)}`,
    languages,
  };
}
