/**
 * G-DELIVERABILITY-1: aggregate Resend webhook events for ops monitoring.
 *
 * Auth: `Authorization: Bearer ${ADMIN_API_KEY}` — a static, rotatable key in
 * Vercel env. Plain bearer is fine here because the endpoint only reads
 * aggregate counts from public.email_events; no PII is returned.
 *
 * Usage:
 *   curl -H "Authorization: Bearer $ADMIN_API_KEY" \
 *        "https://glatko.app/api/admin/email-stats?days=7"
 */
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";

const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

function safeDays(raw: string | null): number {
  if (!raw) return DEFAULT_DAYS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_DAYS;
  return Math.min(n, MAX_DAYS);
}

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 },
  );
}

export async function GET(req: NextRequest) {
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

  const url = new URL(req.url);
  const days = safeDays(url.searchParams.get("days"));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_events")
    .select("event_type")
    .gte("occurred_at", since);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const k = String(row.event_type);
    counts[k] = (counts[k] ?? 0) + 1;
  }

  const sent = counts.sent ?? 0;
  const delivered = counts.delivered ?? 0;
  const bounced = counts.bounced ?? 0;
  const complained = counts.complained ?? 0;

  const pct = (n: number, d: number) =>
    d > 0 ? `${((n / d) * 100).toFixed(2)}%` : "N/A";

  return NextResponse.json({
    success: true,
    period_days: days,
    total_events: data?.length ?? 0,
    counts,
    rates: {
      delivery_rate: pct(delivered, sent),
      bounce_rate: pct(bounced, sent),
      complaint_rate: pct(complained, sent),
    },
  });
}
