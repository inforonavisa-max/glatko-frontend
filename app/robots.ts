import type { MetadataRoute } from "next";

/**
 * robots.txt with explicit AI crawler allow rules.
 *
 * Glatko-specific decisions:
 *   - All authenticated app routes (/dashboard, /admin, /pro/dashboard,
 *     /inbox, /settings, /api) are disallowed for indexing.
 *   - Filtered URL params (?sort, ?view, ?page) are disallowed so engines
 *     don't dilute the canonical URL signal across query variants.
 *   - AI crawlers (GPTBot, PerplexityBot, ClaudeBot, Google-Extended,
 *     ChatGPT-User, CCBot) are explicitly allowed because we want
 *     Glatko to be citable in LLM answers. The default `User-agent: *`
 *     rule already permits them, but explicit rules signal intent and
 *     survive future operator changes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/pro/dashboard/",
          "/inbox/",
          "/settings/",
          "/api/",
          "/auth/",
          "/preview/",
          "/studio/",
          "/*?sort=*",
          "/*?view=*",
          "/*?page=*",
          // Next.js dynamic OG/Twitter image routes serve PNG, not HTML.
          // Google still tried to crawl them as pages and logged 61 "Not
          // found (404)" entries in GSC (audit 2026-05-18, Bug E). Block
          // crawl so the OG meta tag value is still usable but the route
          // itself never enters the index.
          "/*/opengraph-image*",
          "/*/twitter-image*",
        ],
      },
      { userAgent: "Yandex", allow: ["/ru/", "/uk/", "/me/", "/sr/", "/"] },
      // AI search and LLM training crawlers — explicit allow.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
    ],
    sitemap: "https://glatko.app/sitemap.xml",
  };
}
