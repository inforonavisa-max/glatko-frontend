/**
 * G-WA-OPTOUT: Infobip WhatsApp inbound (MO) webhook receiver.
 *
 * Infobip forwards every message a user sends to our WhatsApp sender
 * (447860089253) here as an HTTPS POST (per-sender "Forward to HTTP"
 * configuration). Unlike Resend there is no Svix signing — auth is a shared
 * secret we configure as a custom header on the Infobip side:
 *   x-glatko-webhook-secret: <INFOBIP_INBOUND_WEBHOOK_SECRET>
 *
 * What we do per inbound message (lib/notifications/wa-stop-keywords.ts):
 *   stop  → set messaging_opt_in=false (+at, source='whatsapp_stop') for ALL
 *           users matching the sender phone (find_users_by_phone RPC;
 *           auth.users.phone is UNIQUE so practically 0/1). Suppression is
 *           effective immediately — whatsappEligible in external-dispatch
 *           already requires messaging_opt_in === true; SMS is untouched.
 *   start → audit only. NEVER auto re-opt-in: consent must come explicitly
 *           through the settings UI (WhatsApp policy).
 *   none  → audit only (every inbound lands in wa_inbound_events for review).
 *
 * Returning 200 quickly matters (mirror of the Resend receiver): processing
 * errors are captured to Sentry but still ack'd so Infobip doesn't retry-storm
 * us; only a bad/missing secret gets 401 (and missing server config 503).
 */
import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";
import { classifyWaInbound } from "@/lib/notifications/wa-stop-keywords";

type InfobipInboundMessage = {
  from?: string;
  to?: string;
  messageId?: string;
  receivedAt?: string;
  message?: { type?: string; text?: string };
};

type InfobipInboundPayload = { results?: InfobipInboundMessage[] };

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const expected = process.env.INFOBIP_INBOUND_WEBHOOK_SECRET;
  if (!expected) {
    console.error(
      "[GLATKO:wa-inbound] INFOBIP_INBOUND_WEBHOOK_SECRET not configured",
    );
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!secretMatches(request.headers.get("x-glatko-webhook-secret"), expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Lenient parse: Infobip owns the format; anything unexpected is ack'd (200)
  // and logged rather than 4xx'd, so a format drift can't cause retry storms.
  let payload: InfobipInboundPayload | null = null;
  try {
    payload = (await request.json()) as InfobipInboundPayload;
  } catch {
    payload = null;
  }
  const results = Array.isArray(payload?.results) ? payload.results : [];
  if (results.length === 0) {
    console.warn("[GLATKO:wa-inbound] empty or unparseable payload");
    return NextResponse.json({ received: 0 });
  }

  const admin = createAdminClient();
  let processed = 0;

  for (const item of results) {
    try {
      const fromPhone = (item.from ?? "").trim();
      // Only TEXT messages carry an opt-out keyword; media/buttons → "none".
      const text =
        item.message?.type === "TEXT" ? (item.message.text ?? "") : null;
      const action = text === null ? "none" : classifyWaInbound(text);

      let matchedIds: string[] = [];
      if (action === "stop" && fromPhone) {
        const { data: ids, error: rpcErr } = await admin.rpc(
          "find_users_by_phone",
          { p_phone: fromPhone },
        );
        if (rpcErr) throw new Error(`find_users_by_phone: ${rpcErr.message}`);
        matchedIds = (ids ?? []) as string[];
        if (matchedIds.length > 0) {
          const { error: updErr } = await admin
            .from("profiles")
            .update({
              messaging_opt_in: false,
              messaging_opt_in_at: new Date().toISOString(),
              opt_in_source: "whatsapp_stop",
            })
            .in("id", matchedIds);
          if (updErr) throw new Error(`suppress update: ${updErr.message}`);
          console.log(
            `[GLATKO:wa-inbound] opt_out applied users=${matchedIds.length}`,
          );
        }
      }

      const auditAction =
        action === "stop"
          ? "opt_out"
          : action === "start"
            ? "optin_request"
            : "none";
      const { error: insErr } = await admin.from("wa_inbound_events").insert({
        from_phone: fromPhone || "unknown",
        message_text: text,
        matched_user_ids: matchedIds,
        action: auditAction,
        raw: item as Record<string, unknown>,
      });
      if (insErr) throw new Error(`audit insert: ${insErr.message}`);
      processed += 1;
    } catch (err) {
      glatkoCaptureException(err, { module: "wa-inbound" });
      console.error("[GLATKO:wa-inbound] item processing failed", err);
    }
  }

  return NextResponse.json({ received: processed });
}
