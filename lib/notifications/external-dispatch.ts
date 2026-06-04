import { createAdminClient } from "@/supabase/server";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";
import { sendSms } from "@/lib/sms/infobip";

/**
 * Faz 2-A — external-channel (SMS / Viber / WhatsApp) notification dispatch.
 *
 * Called fire-and-forget from createNotification AFTER the in-app row is written,
 * so it never blocks or breaks in-app. It NEVER routes through
 * notificationDispatcher's ResendEmailProvider (which calls createNotification) —
 * that would recurse; it talks to Infobip directly via the proven sendSms.
 *
 * NOTE: the Infobip omnichannel Messages API (/messages/1/messages) is NOT
 * available on this account (returns 404; auth OK), so SMS goes through the live
 * SMS API (lib/sms/infobip.ts sendSms, POST /sms/3/messages). Faz 3 decides the
 * multi-channel failover transport (activate Messages API vs per-channel APIs +
 * sendCascade); the channel `order` below is computed now for forward-compat.
 *
 * Target number = auth.users.phone (NOT profiles.phone, which is NULL for
 * phone-OTP signups). Channel preference = profiles.notification_channel.
 *
 * SAFETY: off unless EXTERNAL_NOTIFICATIONS_ENABLED === "true" — the code can
 * ship live with ZERO real sends until we flip it (controlled rollout). When
 * EXTERNAL_NOTIFICATIONS_TEST_PHONES is set, ONLY those numbers receive.
 *
 * This sprint sends SMS only (Viber/WhatsApp need approved templates — Faz 3).
 * The failover `order` is computed + logged for forward-compat but delivery is
 * SMS. Chat messages (message/thread_message) are deferred to the unread-gated
 * cron (Faz 2-C), not sent instantly here.
 */

const DEFAULT_USER_TIMEZONE = "Europe/Podgorica";
const DEFAULT_DAILY_EXTERNAL_CAP = 10;

/** Critical types bypass quiet hours + the daily cap (mirror lib/email/dispatch.ts). */
const CRITICAL_TYPES = new Set<string>([
  "bid_accepted",
  "verification_approved",
  "verification_rejected",
]);

/** Chat-message types: external delivery deferred to the cron (Faz 2-C). */
const DEFERRED_TO_CRON = new Set<string>(["message", "thread_message"]);

export type ChannelPref = "whatsapp" | "viber" | null;
export type FailoverChannel = "viber" | "whatsapp" | "sms";

/**
 * Forward-compat failover order from the user's stored preference. NULL (not
 * chosen) → full failover. Faz 3 uses this to build the multi-channel Infobip
 * body; Faz 2-A computes + logs it but sends SMS only (templates pending).
 */
export function channelOrder(pref: ChannelPref): FailoverChannel[] {
  if (pref === "viber") return ["viber", "sms"];
  if (pref === "whatsapp") return ["whatsapp", "sms"];
  return ["viber", "whatsapp", "sms"];
}

function dailyCap(): number {
  const n = Number(process.env.DAILY_EXTERNAL_NOTIFICATION_CAP);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_DAILY_EXTERNAL_CAP;
}

function isQuietHours(timezone: string = DEFAULT_USER_TIMEZONE): boolean {
  const hourStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return false;
  return hour >= 22 || hour < 8;
}

function normalizeE164(phone: string): string {
  const t = phone.trim();
  return t.startsWith("+") ? t : `+${t}`;
}

function testPhoneAllowlist(): string[] | null {
  const raw = process.env.EXTERNAL_NOTIFICATIONS_TEST_PHONES;
  if (!raw) return null;
  const list = raw
    .split(",")
    .map((s) => normalizeE164(s))
    .filter((s) => s.length > 3);
  return list.length > 0 ? list : null;
}

export type ExternalDecision =
  | { send: true; phone: string; order: FailoverChannel[]; critical: boolean }
  | { send: false; reason: string };

/**
 * Pure decision (no message send) — testable in isolation and reused by the
 * Faz 2-C cron. Order of gates is deliberate: cheap/safety gates first so we
 * never call Infobip (or even getUserById) when disabled.
 */
export async function shouldSendExternal(params: {
  user_id: string;
  type: string;
}): Promise<ExternalDecision> {
  // 1) SAFETY kill-switch — off unless explicitly enabled (no admin calls either).
  if (process.env.EXTERNAL_NOTIFICATIONS_ENABLED !== "true") {
    return { send: false, reason: "flag_off" };
  }
  // 2) Chat messages → external via the unread-gated cron (Faz 2-C), not instantly.
  if (DEFERRED_TO_CRON.has(params.type)) {
    return { send: false, reason: "deferred_to_cron" };
  }

  const admin = createAdminClient();

  // 3) Target number = auth.users.phone (NOT profiles.phone — NULL for phone-OTP).
  const { data: authData, error: authErr } = await admin.auth.admin.getUserById(
    params.user_id,
  );
  const rawPhone = authData?.user?.phone;
  if (authErr || !rawPhone) {
    return { send: false, reason: "no_phone" };
  }
  const phone = normalizeE164(rawPhone);

  // 4) Test allowlist — when set, ONLY these numbers receive (no real-user sends).
  const allow = testPhoneAllowlist();
  if (allow && !allow.includes(phone)) {
    return { send: false, reason: "not_allowlisted" };
  }

  const critical = CRITICAL_TYPES.has(params.type);

  // 5) Quiet hours (non-critical).
  if (!critical && isQuietHours()) {
    return { send: false, reason: "quiet_hours" };
  }

  // 6) Daily cap (non-critical) — count today's instant in-app notifications for
  //    the user (excludes the cron-deferred chat types). Mirrors the email cap.
  if (!critical) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await admin
      .from("glatko_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.user_id)
      .gte("created_at", since)
      .not("type", "in", "(message,thread_message)");
    if (!countErr && count != null && count > dailyCap()) {
      return { send: false, reason: "daily_cap" };
    }
  }

  // 7) Channel preference → forward-compat failover order.
  const { data: profile } = await admin
    .from("profiles")
    .select("notification_channel")
    .eq("id", params.user_id)
    .maybeSingle();
  const pref = (profile?.notification_channel as ChannelPref) ?? null;

  return { send: true, phone, order: channelOrder(pref), critical };
}

/** SMS body is cost-sensitive (Unicode → ~70 chars/segment); keep it short. */
function composeSmsText(title: string, body?: string): string {
  const parts = [title.trim(), (body ?? "").trim()].filter(Boolean);
  return parts.join(": ").slice(0, 160);
}

/**
 * Fire-and-forget external dispatch. Never throws (caller uses `void … .catch`).
 */
export async function dispatchExternalNotification(params: {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  try {
    const decision = await shouldSendExternal({
      user_id: params.user_id,
      type: params.type,
    });
    if (!decision.send) {
      return;
    }

    // Faz 2-A: deliver via the proven SMS API (sendSms, POST /sms/3/messages —
    // already live for OTP, the single Infobip SMS source). Viber/WhatsApp need
    // approved templates (Faz 3). decision.order is logged for forward-compat.
    const text = composeSmsText(params.title, params.body);
    const res = await sendSms({ to: decision.phone, text });
    if (res.ok) {
      console.log(
        `[GLATKO:external] sent type=${params.type} order=${decision.order.join(">")} via=SMS messageId=${res.messageId}`,
      );
    } else {
      console.error(
        `[GLATKO:external] send failed type=${params.type} error=${res.error}`,
      );
    }
  } catch (err) {
    glatkoCaptureException(err, {
      module: "external-dispatch",
      type: params.type,
    });
  }
}
