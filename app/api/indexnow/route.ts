import { type NextRequest, NextResponse } from "next/server";
import { notifyIndexNow } from "@/lib/seo/indexnow";

/**
 * Admin-only POST endpoint to push URLs to Bing/Yandex/api.indexnow.org via
 * the IndexNow protocol. The verification file at /{INDEXNOW_KEY}.txt is
 * served separately by middleware.
 *
 * Auth: Authorization: Bearer ${ADMIN_API_KEY}
 *
 * Body: { urls: string[] } — relative ("/me/services") or absolute glatko.app URLs.
 *
 * Example:
 *   curl -X POST https://glatko.app/api/indexnow \
 *     -H "Authorization: Bearer $ADMIN_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls": ["/me", "/me/services"]}'
 */

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { success: false, error: "Admin key not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const urls = (body as { urls?: unknown })?.urls;
  if (!Array.isArray(urls) || !urls.every((u) => typeof u === "string")) {
    return NextResponse.json(
      { success: false, error: "Body must be { urls: string[] }" },
      { status: 400 },
    );
  }
  if (urls.length === 0 || urls.length > 10000) {
    return NextResponse.json(
      { success: false, error: "urls length must be 1..10000" },
      { status: 400 },
    );
  }

  const result = await notifyIndexNow(urls as string[]);
  return NextResponse.json(result, {
    status: result.success ? 200 : 502,
  });
}
