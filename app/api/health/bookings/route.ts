import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isHealthVerticalEnabled } from "@/lib/saglik/flags";
import { bookAppointment, dispatchConfirm, type BookErrorCode } from "@/lib/saglik/booking";
import { locales, type Locale } from "@/i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "glatko_hsess";
const PATIENT_COOKIE = "glatko_hpatient";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// HTTP status per business code.
function statusFor(code: BookErrorCode): number {
  if (code === "SLOT_TAKEN") return 409;
  if (code === "HOLD_EXPIRED") return 410;
  if (code === "HOLD_NOT_OWNED" || code === "PATIENT_NOT_VERIFIED" || code === "PATIENT_INVALID") return 403;
  return 503;
}

/**
 * H5b booking. The patient+session are read from httpOnly cookies (set by the
 * OTP-verify step) — the client cannot supply an arbitrary patientId. The
 * migration-071 wrapper re-checks hold ownership + verified status server-side
 * (defense-in-depth) and books atomically (H1 EXCLUDE last guard → SLOT_TAKEN).
 * On success the confirm SMS/email go out immediately; t24/t2 stay for H6.
 */
export async function POST(request: Request) {
  if (!isHealthVerticalEnabled()) return new NextResponse(null, { status: 404 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const o = (raw ?? {}) as Record<string, unknown>;
  const holdId = typeof o.holdId === "string" ? o.holdId.trim() : "";
  const note = typeof o.note === "string" ? o.note.trim().slice(0, 500) : "";
  const locale: Locale =
    typeof o.locale === "string" && (locales as readonly string[]).includes(o.locale)
      ? (o.locale as Locale)
      : "tr";

  if (!UUID_RE.test(holdId)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const jar = cookies();
  const sessionKey = jar.get(SESSION_COOKIE)?.value ?? "";
  const patientId = jar.get(PATIENT_COOKIE)?.value ?? "";
  if (!sessionKey || !UUID_RE.test(patientId)) {
    // No verified patient bound to this session → must complete OTP first.
    return NextResponse.json({ error: "not_verified" }, { status: 403 });
  }

  let result;
  try {
    result = await bookAppointment({
      holdId,
      patientId,
      note: note || null,
      sessionKey,
      locale,
    });
  } catch (e) {
    console.error("[health-bookings] book failed:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  if (!result.ok) {
    return NextResponse.json({ error: "book_failed", code: result.code }, { status: statusFor(result.code) });
  }

  // Confirm SMS + email (immediate, best-effort, no PII logged). Awaited so the
  // serverless invocation doesn't terminate the dispatch.
  await dispatchConfirm(result, locale);

  const res = NextResponse.json({ ok: true, manageToken: result.manageToken });
  // The hold is consumed + the patient is booked; clear the one-shot patient binding.
  res.cookies.set(PATIENT_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return res;
}
