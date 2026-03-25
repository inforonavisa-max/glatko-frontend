import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"];
  const routes: MetadataRoute.Sitemap = [];

  const staticPages = ["", "/services", "/providers", "/about",
    "/terms", "/privacy", "/contact"];

  for (const locale of locales) {
    for (const page of staticPages) {
      routes.push({
        url: `https://glatko.app/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
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
