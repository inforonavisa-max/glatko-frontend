import "server-only";

import { createAdminClient } from "@/supabase/server";
import { getPathname } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/email/resend";
import { sendSms } from "@/lib/sms/infobip";
import { sendEmail } from "@/lib/email/send-email";
import { HealthBookingConfirmEmail } from "@/lib/email/templates/health-booking-confirm";
import { intlLocale } from "@/lib/saglik/intl";
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

// ─────────────────────────────────────────────────────────────────────────────
// H5b — atomic booking + confirm dispatch + onay/cancel (server-only).
//
// All writes go through the migration-071 public SECURITY DEFINER wrappers
// (health.book_appointment is health-schema/service-role-only; the wrapper bridges
// the un-exposed schema + adds session-ownership + verified checks). The confirm
// SMS/email are dispatched here immediately; t24/t2 reminders stay 'pending' for H6.
// ─────────────────────────────────────────────────────────────────────────────

export type BookErrorCode =
  | "SLOT_TAKEN"
  | "HOLD_EXPIRED"
  | "HOLD_NOT_OWNED"
  | "PATIENT_NOT_VERIFIED"
  | "PATIENT_INVALID"
  | "ERROR";

const BOOK_ERROR_CODES: BookErrorCode[] = [
  "SLOT_TAKEN",
  "HOLD_EXPIRED",
  "HOLD_NOT_OWNED",
  "PATIENT_NOT_VERIFIED",
  "PATIENT_INVALID",
];

function parseBookError(message: string): BookErrorCode {
  return BOOK_ERROR_CODES.find((c) => message.includes(c)) ?? "ERROR";
}

type BookDispatch = {
  phoneE164: string;
  email: string | null;
  patientName: string;
  confirmSmsReminderId: string;
  confirmEmailReminderId: string | null;
};
type BookSummary = {
  providerName: string;
  providerTitle: string | null;
  providerSlug: string;
  serviceName: string;
  serviceDurationMin: number;
  servicePriceEur: number | null;
  locationLabel: string;
  locationAddress: string;
  locationCity: string;
};

export type BookResult =
  | {
      ok: true;
      appointmentId: string;
      manageToken: string;
      slotStart: string;
      slotEnd: string;
      dispatch: BookDispatch;
      summary: BookSummary;
    }
  | { ok: false; code: BookErrorCode };

export async function bookAppointment(args: {
  holdId: string;
  patientId: string;
  note: string | null;
  sessionKey: string;
  locale: Locale;
}): Promise<BookResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_book_appointment", {
    p_hold_id: args.holdId,
    p_patient_id: args.patientId,
    p_note: args.note,
    p_session_key: args.sessionKey,
    p_locale: args.locale,
  });
  if (error) {
    return { ok: false, code: parseBookError(error.message) };
  }
  const d = data as Omit<Extract<BookResult, { ok: true }>, "ok">;
  return { ok: true, ...d };
}

async function markReminder(
  reminderId: string,
  status: "sent" | "failed",
  providerMsgId: string | null,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("health_mark_reminder", {
    p_reminder_id: reminderId,
    p_status: status,
    p_provider_msg_id: providerMsgId,
  });
  if (error) console.error("[health-booking] mark_reminder failed:", error.message);
}

/** Localized manage URL for the confirm notifications (cancel/manage page). */
function manageUrl(manageToken: string, locale: Locale): string {
  const path = getPathname({
    href: { pathname: "/health/r/[token]", params: { token: manageToken } },
    locale,
  });
  return `${getSiteUrl()}${path}`;
}

// Backend confirm-SMS templates (not UI dictionary strings). {dt}=date/time, {dr}=doctor.
const CONFIRM_SMS: Record<Locale, (dt: string, dr: string, url: string) => string> = {
  tr: (dt, dr, url) => `Glatko Sağlık: Randevunuz onaylandı — ${dt}, ${dr}. Yönet/iptal: ${url}`,
  en: (dt, dr, url) => `Glatko Health: Your appointment is confirmed — ${dt}, ${dr}. Manage/cancel: ${url}`,
  de: (dt, dr, url) => `Glatko Health: Ihr Termin ist bestätigt — ${dt}, ${dr}. Verwalten/stornieren: ${url}`,
  it: (dt, dr, url) => `Glatko Health: Appuntamento confermato — ${dt}, ${dr}. Gestisci/annulla: ${url}`,
  ru: (dt, dr, url) => `Glatko Health: Запись подтверждена — ${dt}, ${dr}. Управление/отмена: ${url}`,
  uk: (dt, dr, url) => `Glatko Health: Запис підтверджено — ${dt}, ${dr}. Керування/скасування: ${url}`,
  sr: (dt, dr, url) => `Glatko Zdravlje: Termin potvrđen — ${dt}, ${dr}. Upravljaj/otkaži: ${url}`,
  me: (dt, dr, url) => `Glatko Zdravlje: Termin potvrđen — ${dt}, ${dr}. Upravljaj/otkaži: ${url}`,
  ar: (dt, dr, url) => `Glatko الصحة: تم تأكيد موعدك — ${dt}، ${dr}. الإدارة/الإلغاء: ${url}`,
};

const CONFIRM_EMAIL_SUBJECT: Record<Locale, string> = {
  tr: "Randevunuz onaylandı — Glatko Sağlık",
  en: "Your appointment is confirmed — Glatko Health",
  de: "Ihr Termin ist bestätigt — Glatko Health",
  it: "Appuntamento confermato — Glatko Health",
  ru: "Запись подтверждена — Glatko Health",
  uk: "Запис підтверджено — Glatko Health",
  sr: "Termin potvrđen — Glatko Zdravlje",
  me: "Termin potvrđen — Glatko Zdravlje",
  ar: "تم تأكيد موعدك — Glatko الصحة",
};

/**
 * Sends the confirm SMS (always) + confirm email (if the patient gave one), then
 * marks each confirm reminder sent/failed. Best-effort & two-layer: failures are
 * logged (no PII) and never throw — a notification hiccup must not fail the booking.
 * t24/t2 reminders are left 'pending' for the H6 cron dispatcher.
 */
export async function dispatchConfirm(result: Extract<BookResult, { ok: true }>, locale: Locale): Promise<void> {
  const dateTime = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "Europe/Podgorica",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(result.slotStart));
  const doctor = `${result.summary.providerTitle ? `${result.summary.providerTitle} ` : ""}${result.summary.providerName}`.trim();
  const url = manageUrl(result.manageToken, locale);

  // SMS confirm (PII: phone/name not logged)
  try {
    const sms = await sendSms({
      to: result.dispatch.phoneE164,
      text: CONFIRM_SMS[locale](dateTime, doctor, url),
    });
    await markReminder(result.dispatch.confirmSmsReminderId, sms.ok ? "sent" : "failed", sms.ok ? sms.messageId : null);
  } catch (e) {
    console.error("[health-booking] confirm sms failed:", e instanceof Error ? e.message : "unknown");
    await markReminder(result.dispatch.confirmSmsReminderId, "failed", null);
  }

  // Email confirm (only when the patient provided an email)
  if (result.dispatch.email && result.dispatch.confirmEmailReminderId) {
    try {
      const sent = await sendEmail({
        to: result.dispatch.email,
        subject: CONFIRM_EMAIL_SUBJECT[locale],
        react: HealthBookingConfirmEmail({
          locale,
          patientName: result.dispatch.patientName,
          doctor,
          dateTime,
          serviceName: result.summary.serviceName,
          locationLabel: result.summary.locationLabel,
          locationAddress: result.summary.locationAddress,
          locationCity: result.summary.locationCity,
          manageUrl: url,
        }),
      });
      await markReminder(
        result.dispatch.confirmEmailReminderId,
        sent.success ? "sent" : "failed",
        sent.success ? sent.messageId ?? null : null,
      );
    } catch (e) {
      console.error("[health-booking] confirm email failed:", e instanceof Error ? e.message : "unknown");
      await markReminder(result.dispatch.confirmEmailReminderId, "failed", null);
    }
  }
}

export type AppointmentSummary = {
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  slotStart: string;
  slotEnd: string;
  providerName: string;
  providerTitle: string | null;
  providerSlug: string;
  serviceName: string;
  serviceDurationMin: number;
  servicePriceEur: number | null;
  locationLabel: string;
  locationAddress: string;
  locationCity: string;
  manageToken: string;
};

/** Appointment summary by manage_token (onay + manage pages). PII-free. null = not found. */
export async function getAppointment(
  manageToken: string,
  locale: Locale,
): Promise<AppointmentSummary | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_get_appointment", {
    p_manage_token: manageToken,
    p_locale: locale,
  });
  if (error) {
    throw new Error(`health_get_appointment failed: ${error.message}`);
  }
  return (data as AppointmentSummary | null) ?? null;
}

export type CancelResult =
  | { ok: true; status: "cancelled" }
  | { ok: false; reason: "NOT_FOUND" | "NOT_CANCELLABLE" | "ERROR" };

export async function cancelAppointment(manageToken: string): Promise<CancelResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("health_cancel_appointment", {
    p_manage_token: manageToken,
  });
  if (error) {
    console.error("[health-booking] cancel failed:", error.message);
    return { ok: false, reason: "ERROR" };
  }
  const d = data as { ok: boolean; status?: string; reason?: string };
  if (d.ok) return { ok: true, status: "cancelled" };
  const reason = d.reason === "NOT_FOUND" || d.reason === "NOT_CANCELLABLE" ? d.reason : "ERROR";
  return { ok: false, reason };
}
