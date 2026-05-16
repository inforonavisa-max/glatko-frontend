// app/api/meta/capi/route.ts
//
// Server-side endpoint for Meta Conversions API events.
// Called from client-side via trackEvent() helper (when consent granted).
//
// Why a Route Handler?
// - Keep META_CAPI_ACCESS_TOKEN server-side only (never in client bundle)
// - Forward client IP/UA from request headers (CAPI requirement for matching)
// - Allow safe rate limiting / validation if needed later

import { NextResponse } from "next/server";
import {
  sendCapiEvent,
  type CapiEventPayload,
  type MetaEventName,
} from "@/lib/analytics/meta-capi";

interface CapiRequest {
  event_name: MetaEventName;
  event_id: string;
  event_source_url?: string;
  user_data?: {
    em_hashed?: string;
    ph_hashed?: string;
    fbp?: string;
    fbc?: string;
  };
  custom_data?: CapiEventPayload["custom_data"];
}

export async function POST(request: Request) {
  // Skeleton mode check — fail-fast if env missing
  if (
    !process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    !process.env.META_CAPI_ACCESS_TOKEN
  ) {
    return NextResponse.json(
      { skipped: true, reason: "Meta CAPI not configured" },
      { status: 200 }
    );
  }

  let body: CapiRequest;
  try {
    body = (await request.json()) as CapiRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.event_name || !body.event_id) {
    return NextResponse.json(
      { error: "Missing event_name or event_id" },
      { status: 400 }
    );
  }

  // Extract client info from request headers
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;
  const clientUa = request.headers.get("user-agent") ?? undefined;

  const payload: CapiEventPayload = {
    event_name: body.event_name,
    event_id: body.event_id,
    event_source_url: body.event_source_url,
    user_data: {
      em: body.user_data?.em_hashed,
      ph: body.user_data?.ph_hashed,
      fbp: body.user_data?.fbp,
      fbc: body.user_data?.fbc,
      client_ip_address: clientIp,
      client_user_agent: clientUa,
    },
    custom_data: body.custom_data,
  };

  const result = await sendCapiEvent(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}

// CAPI events are server-to-server; no GET endpoint needed.
export const dynamic = "force-dynamic";
