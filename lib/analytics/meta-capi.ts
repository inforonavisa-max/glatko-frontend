// lib/analytics/meta-capi.ts
//
// Meta Conversions API (CAPI) server-side helper.
// Posts events to Meta's Conversions API endpoint, used in parallel with
// browser-side Pixel for iOS 14.5+ resilience and ad-blocker bypass.
//
// Meta deduplicates events with same `event_id` from Pixel + CAPI.

import crypto from "crypto";

export interface CapiEventPayload {
  event_name: MetaEventName;
  event_id: string; // for deduplication with Pixel
  event_source_url?: string;
  user_data: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    fbp?: string; // _fbp cookie (Pixel browser ID)
    fbc?: string; // _fbc cookie (Pixel click ID)
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    // Glatko-specific
    job_id?: string;
    job_category?: string;
    bid_id?: string;
    provider_id?: string;
    contact_channel?: string;
  };
}

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Lead" // customer_job_posted maps here
  | "InitiateCheckout"
  | "Purchase" // customer_bid_accepted maps here (Year 1: value=0)
  | "Contact" // customer_contact_clicked
  | "CompleteRegistration" // customer_signup
  | "SubmitApplication"; // customer_message_sent (closest standard)

/**
 * Hash PII per Meta's CAPI requirements (SHA-256, lowercase, no whitespace).
 */
function hashPii(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

export function hashEmail(email: string | undefined): string | undefined {
  if (!email) return undefined;
  return hashPii(email);
}

export function hashPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  // Remove non-digits, then hash
  const digits = phone.replace(/\D/g, "");
  return hashPii(digits);
}

/**
 * Send event to Meta CAPI. Server-side only.
 * Safe-fail: returns false if Pixel ID or Access Token missing.
 */
export async function sendCapiEvent(
  payload: CapiEventPayload
): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    // Skeleton mode — no-op
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[CAPI] Skipping — Pixel ID or Access Token missing");
    }
    return { success: false, error: "Missing Pixel ID or Access Token" };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${pixelId}/events`;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: payload.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.event_id,
        event_source_url: payload.event_source_url,
        action_source: "website",
        user_data: payload.user_data,
        custom_data: payload.custom_data,
      },
    ],
    access_token: accessToken,
  };

  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Meta CAPI ${response.status}: ${errorText}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown CAPI error",
    };
  }
}

/**
 * Map Glatko customer event name to Meta standard event name.
 */
export function mapToMetaEvent(
  glatkoEventName: string
): MetaEventName | null {
  const mapping: Record<string, MetaEventName> = {
    customer_signup: "CompleteRegistration",
    customer_job_posted: "Lead",
    customer_contact_clicked: "Contact",
    customer_bid_accepted: "Purchase",
    customer_message_sent: "SubmitApplication",
  };
  return mapping[glatkoEventName] ?? null;
}
