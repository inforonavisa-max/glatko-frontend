import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/pro/dashboard/",
                 "/inbox/", "/api/"],
    },
    sitemap: "https://glatko.app/sitemap.xml",
  };
}
