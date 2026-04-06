import { createElement } from "react";
import { createAdminClient } from "@/supabase/server";
import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import WelcomeEmail from "@/lib/email/templates/welcome";
import {
  coerceEmailLocale,
  getCustomerWelcomeEmailCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

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

/**
 * Sends the customer welcome email at most once per user (row-level claim on welcome_email_sent).
 * Intended for auth callback after email verification / first session exchange.
 */
export async function trySendCustomerWelcomeEmail(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: claimed, error: claimErr } = await admin
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", userId)
    .or("welcome_email_sent.is.null,welcome_email_sent.eq.false")
    .select("id")
    .maybeSingle();

  if (claimErr) {
    console.error("[GLATKO:customer-welcome] claim failed:", claimErr.message);
    return;
  }
  if (!claimed?.id) {
    return;
  }

  const { data: authData, error: authErr } =
    await admin.auth.admin.getUserById(userId);
  if (authErr || !authData?.user?.email) {
    await admin
      .from("profiles")
      .update({ welcome_email_sent: false })
      .eq("id", userId);
    console.error("[GLATKO:customer-welcome] getUserById failed:", authErr);
    return;
  }

  const to = authData.user.email.trim();
  if (!to) {
    await admin
      .from("profiles")
      .update({ welcome_email_sent: false })
      .eq("id", userId);
    return;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("preferred_locale, full_name")
    .eq("id", userId)
    .maybeSingle();

  const locale = coerceEmailLocale(profile?.preferred_locale ?? undefined);
  const copy = getCustomerWelcomeEmailCopy(locale);
  const recipientName = firstName(profile?.full_name ?? undefined);

  const result = await sendEmail({
    to,
    subject: copy.subject,
    react: createElement(WelcomeEmail, {
      recipientName,
      requestServiceUrl: buildLocalizedPath(locale, "/request-service"),
      becomeProUrl: buildLocalizedPath(locale, "/become-a-pro"),
      locale,
    }),
  });

  if (!result.success) {
    await admin
      .from("profiles")
      .update({ welcome_email_sent: false })
      .eq("id", userId);
  }
}
