/**
 * Studio-section layout.
 *
 * The root `app/layout.tsx` already provides the `<html>` + `<body>`
 * shell, and its `resolveLocaleFromPath` falls back to `lang="en"` /
 * `dir="ltr"` for paths outside the [locale] tree (which is exactly what
 * Studio needs — its UI is LTR English only). So this layout adds no
 * structural markup; it only overrides metadata to keep search engines
 * out of /studio (belt-and-suspenders alongside robots.txt).
 *
 * Notably we do NOT import globals.css here: Tailwind's preflight reset
 * collides with @sanity/ui's own resets. The /studio tree therefore
 * inherits root html/body, but page styles come from @sanity/ui only.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glatko Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
