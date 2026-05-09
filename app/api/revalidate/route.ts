/**
 * On-demand ISR revalidation endpoint.
 *
 * Purges the Next data/route cache for a specific path so newly published
 * Sanity content (or any other source) becomes visible without waiting for
 * the page-level `revalidate` window. Also clears stuck error pages — when
 * a route happens to render once during a transient upstream failure,
 * Vercel ISR can keep serving the cached 500 until something explicitly
 * invalidates it.
 *
 * Usage:
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>&path=/en/blog/<slug>
 */
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }
  const path = request.nextUrl.searchParams.get("path") ?? "/";
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
