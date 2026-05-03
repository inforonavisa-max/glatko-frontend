import { NextResponse } from "next/server";

/**
 * IndexNow key verification endpoint.
 *
 * The IndexNow protocol requires search engines (Bing, Yandex, Naver, etc.) to
 * verify ownership by fetching a file containing the publisher's key. Submission
 * calls include `keyLocation: "https://glatko.app/api/indexnow/{KEY}"`; this
 * route returns the key in plain text only when the path matches the env-stored
 * INDEXNOW_KEY exactly. Any other path returns 404.
 *
 * See https://www.indexnow.org/documentation
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const expected = process.env.INDEXNOW_KEY;

  if (!expected || key !== expected) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(expected, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
