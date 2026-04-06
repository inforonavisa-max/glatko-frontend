import { createElement } from "react";
import { createAdminClient } from "@/supabase/server";
import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import CompleteProfileEmail from "@/lib/email/templates/complete-profile";
import {
  coerceEmailLocale,
  getCompleteProfileReminderCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_ACCOUNT_AGE_MS = 3 * MS_PER_DAY;
const MIN_GAP_BETWEEN_REMINDERS_MS = MS_PER_DAY;
const BATCH_LIMIT = 80;

function buildLocalizedPath(locale: EmailLocale, path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${p}`;
}

function firstName(fullName: string | null | undefined): string {
  const t = fullName?.trim();
  if (!t) return "";
  return t.split(/\s+/)[0] ?? "";
}

function profileIncomplete(row: {
  avatar_url: string | null;
  phone: string | null;
  full_name: string | null;
}): boolean {
  const noName = !row.full_name?.trim();
  const noPhone = !row.phone?.trim();
  const noAvatar = !row.avatar_url?.trim();
  return noName || noPhone || noAvatar;
}

/**
 * Sends at most one complete-profile reminder per user per 24h (tracked on
 * `last_profile_completion_reminder_at`). Intended to be called from Vercel Cron
 * or Supabase pg_cron — not wired in this repo.
 */
export async function sendProfileCompletionReminders(): Promise<void> {
  const admin = createAdminClient();
  const now = Date.now();

  const { data: rows, error } = await admin
    .from("profiles")
    .select(
      "id, full_name, avatar_url, phone, preferred_locale, welcome_email_sent, last_profile_completion_reminder_at",
    )
    .eq("welcome_email_sent", true)
    .limit(BATCH_LIMIT);

  if (error) {
    console.error("[GLATKO:profile-reminder] select failed:", error.message);
    return;
  }

  if (!rows?.length) {
    return;
  }

  for (const row of rows) {
    if (!profileIncomplete(row)) {
      continue;
    }

    const last = row.last_profile_completion_reminder_at
      ? new Date(row.last_profile_completion_reminder_at).getTime()
      : 0;
    if (last && now - last < MIN_GAP_BETWEEN_REMINDERS_MS) {
      continue;
    }

    const { data: authData, error: authErr } = await admin.auth.admin.getUserById(
      row.id,
    );
    if (authErr || !authData?.user?.email) {
      continue;
    }

    const createdAt = authData.user.created_at
      ? new Date(authData.user.created_at).getTime()
      : 0;
    if (!createdAt || now - createdAt < MIN_ACCOUNT_AGE_MS) {
      continue;
    }

    const to = authData.user.email.trim();
    if (!to) {
      continue;
    }

    const locale = coerceEmailLocale(row.preferred_locale ?? undefined);
    const copy = getCompleteProfileReminderCopy(locale);
    const recipientName = firstName(row.full_name ?? undefined);

    const result = await sendEmail({
      to,
      subject: copy.subject,
      react: createElement(CompleteProfileEmail, {
        recipientName,
        profileUrl: buildLocalizedPath(locale, "/settings/profile"),
        locale,
        missingAvatar: !row.avatar_url?.trim(),
        missingPhone: !row.phone?.trim(),
        missingName: !row.full_name?.trim(),
      }),
    });

    if (result.success) {
      await admin
        .from("profiles")
        .update({
          last_profile_completion_reminder_at: new Date().toISOString(),
        })
        .eq("id", row.id);
    }
  }
}
