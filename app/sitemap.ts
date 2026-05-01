import type { MetadataRoute } from "next";

const LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
const BASE = "https://glatko.app";

function hreflangForLocale(locale: string): string {
  if (locale === "me") return "sr-ME";
  if (locale === "sr") return "sr-RS";
  return locale;
}

function makeAlternates(path: string): Record<string, string> {
  return Object.fromEntries([
    ...LOCALES.map((l) => [hreflangForLocale(l), `${BASE}/${l}${path}`]),
    ["x-default", `${BASE}/en${path}`],
  ]);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/become-a-pro", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/cookies", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/gdpr", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const categorySlugs = [
    "home-services",
    "boat-services",
    "general-cleaning",
    "deep-cleaning",
    "villa-airbnb",
    "renovation",
    "painting",
    "electrical",
    "plumbing",
    "ac-heating",
    "furniture-assembly",
    "garden",
    "pool",
    "captain-hire",
    "antifouling",
    "engine-service",
    "hull-cleaning",
    "winterization",
    "charter-prep",
    "emergency-repair",
    "haul-out",
  ];

  const routes: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: makeAlternates(page.path),
        },
      });
    }
  }

  for (const slug of categorySlugs) {
    const path = `/services/${slug}`;
    for (const locale of LOCALES) {
      routes.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: makeAlternates(path),
        },
      });
    }
  }

  return routes;
}
