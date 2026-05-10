import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// G-PERF-2 Faz 6: opt-in bundle analyzer.
// Run with `ANALYZE=true npm run build`; reports drop into .next/analyze/.
// Disabled by default so the production build chain stays unchanged.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cjqappdfyxgytdyeytwv.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    formats: ["image/avif", "image/webp"],
    // Compensate for Supabase Storage's `cache-control: no-cache` default —
    // hero images are immutable and OK to cache aggressively at the Next layer.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    const localePattern = "/:locale(me|en|tr|sr|de|it|ru|ar|uk)";
    const renames = [
      { from: "general-cleaning", to: "regular-cleaning" },
      { from: "villa-airbnb", to: "villa-cleaning" },
      { from: "engine-service", to: "boat-engine-service" },
      { from: "captain-hire", to: "captain-daily" },
      { from: "winterization", to: "winter-storage" },
      { from: "charter-prep", to: "charter-cleaning" },
    ];
    const slugRenames = renames.map(({ from, to }) => ({
      source: `${localePattern}/services/${from}`,
      destination: `/:locale/services/${to}`,
      permanent: true,
    }));
    // G-CAT-3: /providers retired in favour of /services + premium search
    const providersRetired = [
      {
        source: `${localePattern}/providers`,
        destination: "/:locale/services?openSearch=1",
        permanent: true,
      },
      {
        source: `${localePattern}/providers/:path*`,
        destination: "/:locale/services?openSearch=1",
        permanent: true,
      },
    ];
    return [...providersRetired, ...slugRenames];
  },
};

const withIntl = withNextIntl(nextConfig);
const withAnalyzer = withBundleAnalyzer(withIntl);

export default withSentryConfig(withAnalyzer, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
