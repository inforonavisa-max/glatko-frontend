/**
 * G-DELIVERABILITY-1: Resend webhook receiver.
 *
 * Resend signs webhooks via Svix (svix-id, svix-timestamp, svix-signature).
 * The standardwebhooks library accepts both `svix-*` and `webhook-*` header
 * shapes — we normalize to `webhook-*` so a single Webhook constructor works.
 *
 * What we persist:
 *   - public.email_events row for every event type we recognize (analytics).
 *   - On hard bounces and spam complaints, also flag user_metadata so future
 *     sendEmail calls can short-circuit before hitting Resend.
 *
 * Returning 200 quickly is important — Resend retries non-2xx for an hour.
 */
import { Webhook } from "standardwebhooks";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/supabase/server";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

type ResendBounce = { type?: "hard" | "soft"; message?: string };
type ResendTag = { name: string; value: string };

type ResendWebhookEvent = {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  data: {
    email_id?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: ResendBounce;
    tags?: ResendTag[] | Record<string, string>;
  };
  created_at: string;
};

const HANDLED_TYPES: ResendWebhookEvent["type"][] = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.opened",
  "email.clicked",
];

function decodeHookSecret(raw: string): string {
  // Resend issues secrets prefixed with `whsec_`. standardwebhooks accepts
  // either the raw secret or the `whsec_<base64>` form.
  return raw;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function firstRecipient(to: ResendWebhookEvent["data"]["to"]): string | null {
  if (!to) return null;
  if (typeof to === "string") return to;
  if (Array.isArray(to) && to.length > 0) return to[0];
  return null;
}

function normalizeTags(
  tags: ResendWebhookEvent["data"]["tags"],
): Record<string, string> | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const out: Record<string, string> = {};
    for (const t of tags) {
      if (t && typeof t.name === "string") out[t.name] = String(t.value ?? "");
    }
    return out;
  }
  return tags as Record<string, string>;
}

function shortEventType(t: ResendWebhookEvent["type"]): string {
  return t.startsWith("email.") ? t.slice("email.".length) : t;
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/resend",
    handles: HANDLED_TYPES,
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[GLATKO:resend-webhook] RESEND_WEBHOOK_SECRET unset");
    return jsonError("Webhook secret not configured", 503);
  }

  const body = await request.text();
  // Resend uses `svix-*`; standardwebhooks expects either prefix.
  const headers = {
    "webhook-id":
      request.headers.get("svix-id") ??
      request.headers.get("webhook-id") ??
      "",
    "webhook-timestamp":
      request.headers.get("svix-timestamp") ??
      request.headers.get("webhook-timestamp") ??
      "",
    "webhook-signature":
      request.headers.get("svix-signature") ??
      request.headers.get("webhook-signature") ??
      "",
  };

  let event: ResendWebhookEvent;
  try {
    const wh = new Webhook(decodeHookSecret(secret));
    event = wh.verify(body, headers) as ResendWebhookEvent;
  } catch (err) {
    console.warn(
      "[GLATKO:resend-webhook] signature verify failed",
      err instanceof Error ? err.message : err,
    );
    return jsonError("Invalid webhook signature", 401);
  }

  if (!event?.type || !HANDLED_TYPES.includes(event.type)) {
    return NextResponse.json({ success: true, ignored: event?.type ?? null });
  }

  const recipient = firstRecipient(event.data?.to);
  if (!recipient) {
    return jsonError("Webhook payload missing recipient", 400);
  }

  const supabase = createAdminClient();
  const tagsObj = normalizeTags(event.data?.tags);

  // 1) Persist event row (analytics + bounce-aware sendEmail lookup).
  try {
    const insert = await supabase.from("email_events").insert({
      email_id: event.data?.email_id ?? "",
      event_type: shortEventType(event.type),
      recipient,
      bounce_type:
        event.type === "email.bounced" ? event.data?.bounce?.type ?? null : null,
      bounce_message:
        event.type === "email.bounced"
          ? event.data?.bounce?.message ?? null
          : null,
      tags: tagsObj,
      occurred_at: event.created_at,
    });
    if (insert.error) {
      console.error(
        "[GLATKO:resend-webhook] email_events insert error",
        insert.error.message,
      );
    }
  } catch (err) {
    glatkoCaptureException(err, {
      module: "resend-webhook",
      step: "insert-event",
      eventType: event.type,
    });
  }

  // 2) For hard bounces and complaints, also flag the user so future emails
  //    short-circuit before hitting Resend.
  const isHardBounce =
    event.type === "email.bounced" && event.data?.bounce?.type === "hard";
  const isComplaint = event.type === "email.complained";

  if (isHardBounce || isComplaint) {
    try {
      const { data: userId, error: rpcError } = await supabase.rpc(
        "glatko_get_user_id_by_email",
        { p_email: recipient },
      );
      if (rpcError) {
        console.warn(
          "[GLATKO:resend-webhook] user lookup rpc error",
          rpcError.message,
        );
      } else if (userId) {
        const flagPatch: Record<string, unknown> = {};
        if (isHardBounce) {
          flagPatch.email_invalid = true;
          flagPatch.email_invalid_at = event.created_at;
          flagPatch.email_bounce_message = event.data?.bounce?.message ?? null;
        }
        if (isComplaint) {
          flagPatch.spam_complaint = true;
          flagPatch.spam_complaint_at = event.created_at;
        }
        const updateRes = await supabase.auth.admin.updateUserById(
          String(userId),
          { user_metadata: flagPatch },
        );
        if (updateRes.error) {
          console.warn(
            "[GLATKO:resend-webhook] updateUserById failed",
            updateRes.error.message,
          );
        }
      }
    } catch (err) {
      glatkoCaptureException(err, {
        module: "resend-webhook",
        step: "flag-user",
        eventType: event.type,
      });
    }
  }

  return NextResponse.json({ success: true, type: event.type });
}
