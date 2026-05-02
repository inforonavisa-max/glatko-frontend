import { NextResponse } from "next/server";
import { activateAllPendingWaitlists } from "@/lib/notifications/match-dispatch";

/**
 * G-REQ-2 wait-list activation cron — runs every 5 min (vercel.json).
 *
 * For each request whose primary dispatch is ≥30 min old AND has <3
 * quotes, flips the wait-list 7 pros from notified_at=NULL to NOW()
 * and sends them in-app + email. Idempotent: requests that already
 * cleared the bar are no-ops.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await activateAllPendingWaitlists();
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
