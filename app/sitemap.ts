import type { MetadataRoute } from "next";

import {
  getAllActiveCategories,
  getProfessionalsForSitemap,
} from "@/lib/supabase/glatko.server";
import { getAllPostSlugs } from "@/lib/sanity/fetch";
import { SEO_BASE, SEO_LOCALES, hreflangForLocale } from "@/lib/seo";

// Force runtime evaluation. Our Supabase server client depends on `cookies()`,
// which throws during build-time prerender; without this the DB-driven
// category list comes back empty and only the static-page entries ship.
// Cached for 1h to amortize the DB hit across crawler bursts.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const LOCALES = SEO_LOCALES;

function makeAlternates(path: string): Record<string, string> {
  return Object.fromEntries([
    ...LOCALES.map((l) => [hreflangForLocale(l), `${SEO_BASE}/${l}${path}`]),
    ["x-default", `${SEO_BASE}/en${path}`],
  ]);
}

const STATIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/become-a-pro", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/cookies", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/gdpr", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
] as const;

/**
 * G-CAT-4 + G-SEO-FOUNDATION: dynamic sitemap.
 * - Static pages × 9 locales (81 URLs).
 * - Active categories from DB × 9 locales.
 * - Active+approved provider profiles at /{locale}/pros/{slug} × 9 locales
 *   (G-SEO-FOUNDATION Faz 6: replaces UUID surface with stable slugs).
 *
 * Each entry carries 9-locale hreflang alternates so Search Console can
 * deduplicate locale variants.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, professionals, blogSlugs] = await Promise.all([
    getAllActiveCategories(),
    getProfessionalsForSitemap(),
    // Sanity fetch — tolerate failure so a CMS hiccup never breaks
    // the catalog half of the sitemap.
    getAllPostSlugs("me").catch(() => []),
  ]);
  const buildTime = new Date();
  const routes: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      routes.push({
        url: `${SEO_BASE}/${locale}${page.path}`,
        lastModified: buildTime,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: makeAlternates(page.path) },
      });
    }
  }

  for (const category of categories) {
    const path = `/services/${category.slug}`;
    const lastModified = category.created_at
      ? new Date(category.created_at)
      : buildTime;
    // Roots (parent_id IS NULL) outrank sub-cats slightly so Google's
    // priority hint reflects the catalog hierarchy.
    const priority = category.parent_id === null ? 0.8 : 0.7;
    for (const locale of LOCALES) {
      routes.push({
        url: `${SEO_BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority,
        alternates: { languages: makeAlternates(path) },
      });
    }
  }

  for (const pro of professionals) {
    const path = `/pros/${pro.slug}`;
    const lastModified = pro.updated_at
      ? new Date(pro.updated_at)
      : buildTime;
    for (const locale of LOCALES) {
      routes.push({
        url: `${SEO_BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages: makeAlternates(path) },
      });
    }
  }

  // G-CMS-1: Sanity blog posts. ME is the primary locale; until per-locale
  // sitemap fetches are wired we surface the ME slug (which equals the URL
  // path on /me/blog/[slug]). Other locales serving the same article via
  // their own slug join the canonical via hreflang on the post page.
  for (const post of blogSlugs) {
    if (!post.slug) continue;
    const path = `/blog/${post.slug}`;
    const lastModified = post.publishedAt
      ? new Date(post.publishedAt)
      : buildTime;
    for (const locale of LOCALES) {
      routes.push({
        url: `${SEO_BASE}/${locale}${path}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages: makeAlternates(path) },
      });
    }
  }

  return routes;
}
