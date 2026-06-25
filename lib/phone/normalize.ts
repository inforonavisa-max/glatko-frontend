import "server-only";

import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { isSupportedPhoneCountry } from "@/lib/phone/countries";

/**
 * Shared server-side E.164 normalizer for ALL marketplace phone write points
 * (pro onboarding, profile settings, service-request contact, admin provider).
 *
 * Uses libphonenumber-js — the SAME library + default region (Montenegro) the
 * one-off DB cleanup used — so a number written through any path matches what
 * cleanup produced (no drift). Authoritative: every phone-writing server action
 * runs input through this BEFORE persisting, so a bad number cannot enter the
 * DB even via a direct REST/edge call that bypasses the client UI.
 *
 * Behaviour (mirrors lib/phone/login-phone.ts, kariyer/saglik phone helpers):
 *   • International input ("+90 532…", "0049…") parses to its own country; the
 *     default region is ignored.
 *   • Bare national input ("069 868 069") is interpreted for `region`
 *     (ME → "+38269868069").
 *   • Validity uses libphonenumber-js `.isValid()` — wrong length/prefix for the
 *     country is rejected (so "+90 0532…", "abc", "12" all fail).
 *
 * Returns a machine `error` code the caller maps to a localized message.
 */
export type PhoneNormalizeResult =
  | { ok: true; e164: string }
  | { ok: false; error: "empty" | "invalid" };

export function normalizePhoneE164(
  input: string | null | undefined,
  region = "ME",
): PhoneNormalizeResult {
  const raw = (input ?? "").trim();
  if (!raw) return { ok: false, error: "empty" };

  const r = (isSupportedPhoneCountry(region) ? region : "ME") as CountryCode;
  try {
    const parsed = parsePhoneNumberFromString(raw, r);
    if (!parsed || !parsed.isValid()) return { ok: false, error: "invalid" };
    return { ok: true, e164: parsed.number };
  } catch {
    return { ok: false, error: "invalid" };
  }
}
