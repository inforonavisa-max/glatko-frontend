import { SEO_BASE, SEO_LOCALES, hreflangForLocale } from "@/lib/seo";

export function HreflangLinks({ locale, path }: { locale: string; path: string }) {
  return (
    <>
      <link rel="canonical" href={`${SEO_BASE}/${locale}${path}`} />
      {SEO_LOCALES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={hreflangForLocale(l)}
          href={`${SEO_BASE}/${l}${path}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${SEO_BASE}/en${path}`} />
    </>
  );
}
