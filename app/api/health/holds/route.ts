import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { isHealthVerticalEnabled } from "@/lib/saglik/flags";
import { createHold, releaseHold, type HoldErrorCode } from "@/lib/saglik/booking";

// Service-role write path; never statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_COOKIE = "glatko_hsess";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_HOLD_MINUTES = 240; // sanity ceiling on slot length

// 409 (already taken/held) vs 400 (bad request) per business code.
const CONFLICT_CODES: HoldErrorCode[] = ["SLOT_TAKEN", "SLOT_HELD"];

function readBody(b: unknown) {
  if (typeof b !== "object" || b === null) return null;
  const o = b as Record<string, unknown>;
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    providerId: s(o.providerId),
    serviceId: s(o.serviceId),
    locationId: s(o.locationId),
    slotStart: s(o.slotStart),
    slotEnd: s(o.slotEnd),
  };
}

function getOrCreateSession(): { key: string; isNew: boolean } {
  const jar = cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing && existing.length >= 16) return { key: existing, isNew: false };
  return { key: randomBytes(24).toString("hex"), isNew: true };
}

export async function POST(request: Request) {
  if (!isHealthVerticalEnabled()) return new NextResponse(null, { status: 404 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const body = readBody(raw);
  if (!body) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const start = Date.parse(body.slotStart);
  const end = Date.parse(body.slotEnd);
  if (
    !UUID_RE.test(body.providerId) ||
    !UUID_RE.test(body.serviceId) ||
    !UUID_RE.test(body.locationId) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start ||
    end - start > MAX_HOLD_MINUTES * 60_000
  ) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const { key, isNew } = getOrCreateSession();

  let result;
  try {
    result = await createHold({
      providerId: body.providerId,
      serviceId: body.serviceId,
      locationId: body.locationId,
      slotStart: new Date(start).toISOString(),
      slotEnd: new Date(end).toISOString(),
      sessionKey: key,
    });
  } catch (e) {
    console.error("[health-holds] create failed:", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  if (!result.ok) {
    const status = CONFLICT_CODES.includes(result.code) ? 409 : 400;
    return NextResponse.json({ error: "hold_failed", code: result.code }, { status });
  }

  const res = NextResponse.json({ holdId: result.holdId, expiresAt: result.expiresAt });
  if (isNew) {
    res.cookies.set(SESSION_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1h is plenty for a 5-min hold + booking
    });
  }
  return res;
}

export async function DELETE(request: Request) {
  if (!isHealthVerticalEnabled()) return new NextResponse(null, { status: 404 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const holdId = typeof (raw as Record<string, unknown>)?.holdId === "string"
    ? ((raw as Record<string, string>).holdId).trim()
    : "";
  if (!UUID_RE.test(holdId)) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const key = cookies().get(SESSION_COOKIE)?.value;
  if (!key) return NextResponse.json({ ok: true }); // no session → nothing to release

  try {
    await releaseHold(holdId, key);
  } catch (e) {
    console.error("[health-holds] release failed:", e instanceof Error ? e.message : "unknown");
  }
  return NextResponse.json({ ok: true });
}
