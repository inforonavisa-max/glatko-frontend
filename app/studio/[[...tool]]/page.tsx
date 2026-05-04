/**
 * Sanity Studio mount point (server component).
 *
 * Embedded at /studio via Next.js optional-catch-all route. This file
 * stays a server component so we can re-export `metadata` / `viewport`
 * from `next-sanity/studio`. The Studio React tree itself (which calls
 * createContext at module load) is isolated in `./Studio.tsx`.
 *
 * Excluded from search indexing — both via the studio layout's metadata
 * (`robots: noindex, nofollow`) and via `app/robots.ts` which disallows
 * /admin and /studio surfaces.
 */

import { Studio } from "./Studio";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
