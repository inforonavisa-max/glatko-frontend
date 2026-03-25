import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"];
  const routes: MetadataRoute.Sitemap = [];

  const staticPages = [
    { path: "", freq: "daily" as const, priority: 1.0 },
    { path: "/services", freq: "weekly" as const, priority: 0.9 },
    { path: "/providers", freq: "daily" as const, priority: 0.9 },
    { path: "/become-a-pro", freq: "monthly" as const, priority: 0.7 },
    { path: "/about", freq: "monthly" as const, priority: 0.6 },
    { path: "/terms", freq: "monthly" as const, priority: 0.4 },
    { path: "/privacy", freq: "monthly" as const, priority: 0.4 },
    { path: "/cookies", freq: "monthly" as const, priority: 0.3 },
    { path: "/gdpr", freq: "monthly" as const, priority: 0.4 },
    { path: "/contact", freq: "monthly" as const, priority: 0.6 },
  ];

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `https://glatko.app/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
      });
    }
  }

  const categorySlugs = [
    "home-services", "boat-services",
    "general-cleaning", "deep-cleaning", "villa-airbnb",
    "renovation", "painting", "electrical", "plumbing",
    "ac-heating", "furniture-assembly", "garden", "pool",
    "captain-hire", "antifouling", "engine-service",
    "hull-cleaning", "winterization", "charter-prep",
    "emergency-repair", "haul-out",
  ];

  for (const locale of locales) {
    for (const slug of categorySlugs) {
      routes.push({
        url: `https://glatko.app/${locale}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return routes;
}
