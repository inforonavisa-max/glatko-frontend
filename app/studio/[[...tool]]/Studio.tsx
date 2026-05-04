"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity/sanity.config";

/**
 * Client-only Studio bundle. Isolated in its own component so the page
 * file can stay a server component (which is necessary for re-exporting
 * `metadata` / `viewport` from `next-sanity/studio`).
 */
export function Studio() {
  return <NextStudio config={config} />;
}
