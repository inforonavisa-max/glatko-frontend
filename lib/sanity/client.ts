/**
 * Sanity clients for Glatko.
 *
 *   publicClient  — `published` perspective via the CDN. Safe to import
 *                   from RSC, Server Components, Route Handlers used for
 *                   public rendering / sitemap.
 *
 *   previewClient — `drafts` perspective with `useCdn: false`. For an
 *                   editor-facing preview surface (not wired up in this
 *                   first PR but kept ready). Requires
 *                   SANITY_API_READ_TOKEN (server-only env var).
 *
 * Do NOT import this module from sanity/sanity.config.ts — Studio has
 * its own client instantiated by defineConfig().
 */

import { createClient, type ClientConfig } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID is not set — check .env.local (local) or Vercel project env (prod).",
  );
}
if (!dataset) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_DATASET is not set — check .env.local (local) or Vercel project env (prod).",
  );
}

const baseConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
};

export const publicClient = createClient(baseConfig);

export const previewClient = createClient({
  ...baseConfig,
  useCdn: false,
  perspective: "drafts",
  token: process.env.SANITY_API_READ_TOKEN,
  stega: false,
});

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
} as const;
