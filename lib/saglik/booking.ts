import "server-only";

import { createAdminClient } from "@/supabase/server";
import type { Locale } from "@/i18n/routing";

/**
 * Glatko Sağlık — H5a booking write/read data-access (server-only).
 *
 * Symmetric with lib/saglik/queries.ts (reads): the health schema is NOT exposed
 * to PostgREST, so every hold/OTP/patient operation goes through the public
 * SECURITY DEFINER RPCs from migration 070, called with the service-role client.
 * H5a does NOT book — health.book_appointment is H5b. Here: 5-min hold + OTP
 * issue/verify + (on verify) the encrypted patient row.
 *
 * RPC-raised business errors surface as PostgREST errors whose message IS the
 * raised code (e.g. "SLOT_HELD"); parseHoldError maps them to a stable union.
 */

export type HoldErrorCode =
  | "SLOT_TAKEN"
  | "SLOT_HELD"
  | "SLOT_PAST"
  | "SLOT_INVALID"
  | "PROVIDER_UNAVAILABLE"
  | "SERVICE_INVALID"
  | "LOCATION_INVALID"
  | "SESSION_INVALID"
  | "ERROR";

const HOLD_ERROR_CODES: HoldErrorCode[] = [
  "SLOT_TAKEN",
  "SLOT_HELD",
  "SLOT_PAST",
  "SLOT_INVALID",
  "PROVIDER_UNAVAILABLE",
  "SERVICE_INVALID",
  "LOCATION_INVALID",
  "SESSION_INVALID",
];

function parseHoldError(message: string): HoldErrorCode {
  const hit = HOLD_ERROR_CODES.find((c) => message.includes(c));
  return hit ?? "ERROR";
}

export type CreateHoldResult =
  | { ok: true; holdId: string; expiresAt: string }
  | { ok: false; code: HoldErrorCode };

export async function createHold(args: {
  providerId: string;
  serviceId: string;
  locationId: string;
  slotStart: string; // ISO UTC
  slotEnd: string; // ISO UTC
  sessionKey: string;
}): Promise<CreateHoldResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_create_hold", {
    p_provider_id: args.providerId,
    p_service_id: args.serviceId,
    p_location_id: args.locationId,
    p_slot_start: args.slotStart,
    p_slot_end: args.slotEnd,
    p_session_key: args.sessionKey,
  });
  if (error) {
    return { ok: false, code: parseHoldError(error.message) };
  }
  const d = data as { holdId: string; expiresAt: string };
  return { ok: true, holdId: d.holdId, expiresAt: d.expiresAt };
}

export async function releaseHold(holdId: string, sessionKey: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_release_hold", {
    p_hold_id: holdId,
    p_session_key: sessionKey,
  });
  if (error) {
    console.error("[health-booking] release_hold failed:", error.message);
    return false;
  }
  return data === true;
}

export type HoldSummary = {
  holdId: string;
  expiresAt: string;
  slotStart: string;
  slotEnd: string;
  providerSlug: string;
  providerName: string;
  providerTitle: string | null;
  serviceName: string;
  serviceDurationMin: number;
  servicePriceEur: number | null;
  locationLabel: string;
  locationAddress: string;
  locationCity: string;
};

/** Hold summary for the booking page. null = expired / not found / wrong session. */
export async function getHold(
  holdId: string,
  sessionKey: string,
  locale: Locale,
): Promise<HoldSummary | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_get_hold", {
    p_hold_id: holdId,
    p_session_key: sessionKey,
    p_locale: locale,
  });
  if (error) {
    throw new Error(`health_get_hold failed: ${error.message}`);
  }
  return (data as HoldSummary | null) ?? null;
}

export async function createOtp(phoneHashHex: string, codeHashHex: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("health_create_otp", {
    p_phone_hash: phoneHashHex,
    p_code_hash: codeHashHex,
  });
  if (error) {
    console.error("[health-booking] create_otp failed:", error.message);
    return false;
  }
  return true;
}

export type VerifyOtpResult =
  | { ok: true; patientId: string }
  | { ok: false; reason: "WRONG_CODE" | "TOO_MANY_ATTEMPTS" | "OTP_EXPIRED" | "CONSENT_REQUIRED" | "ERROR"; attemptsLeft?: number };

export async function verifyOtp(args: {
  phoneHashHex: string;
  codeHashHex: string;
  fullName: string;
  phoneE164: string;
  email: string | null;
  consentHealth: boolean;
  consentMarketing: boolean;
}): Promise<VerifyOtpResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_verify_otp", {
    p_phone_hash: args.phoneHashHex,
    p_code_hash: args.codeHashHex,
    p_full_name: args.fullName,
    p_phone_e164: args.phoneE164,
    p_email: args.email,
    p_consent_health: args.consentHealth,
    p_consent_marketing: args.consentMarketing,
  });
  if (error) {
    // No PII in logs (phone/email/name never logged).
    console.error("[health-booking] verify_otp failed:", error.message);
    return { ok: false, reason: "ERROR" };
  }
  const d = data as
    | { ok: true; patientId: string }
    | { ok: false; reason: string; attemptsLeft?: number };
  if (d.ok) return { ok: true, patientId: d.patientId };
  const known = ["WRONG_CODE", "TOO_MANY_ATTEMPTS", "OTP_EXPIRED", "CONSENT_REQUIRED"] as const;
  const reason = (known as readonly string[]).includes(d.reason)
    ? (d.reason as (typeof known)[number])
    : "ERROR";
  return { ok: false, reason, attemptsLeft: d.attemptsLeft };
}
