import { createElement, type ReactElement } from "react";
import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import type { EmailLocale } from "@/lib/email/templates/translations";
import {
  getBidAcceptedCopy,
  getNewBidReceivedCopy,
  getNewRequestMatchCopy,
} from "@/lib/email/templates/translations";
import BidAcceptedEmail from "@/lib/email/templates/bid-accepted";
import NewBidReceivedEmail from "@/lib/email/templates/new-bid-received";
import NewRequestMatchEmail from "@/lib/email/templates/new-request-match";
import { createAdminClient } from "@/supabase/server";

export type DispatchNotificationType =
  | "new_request_match"
  | "new_bid"
  | "bid_accepted"
  | "bid_rejected"
  | "message"
  | "status_change"
  | "review"
  | "verification_approved"
  | "verification_rejected";

type NotificationPrefsRow = {
  email_new_bid?: boolean;
  email_new_message?: boolean;
  email_new_review?: boolean;
  email_new_request_match?: boolean;
  push_enabled?: boolean;
};

const EMAIL_LOCALES: readonly EmailLocale[] = [
  "en",
  "tr",
  "de",
  "ar",
  "it",
  "me",
  "ru",
  "sr",
  "uk",
];

function coerceEmailLocale(raw: string | null | undefined): EmailLocale {
  if (raw && (EMAIL_LOCALES as readonly string[]).includes(raw)) {
    return raw as EmailLocale;
  }
  return "en";
}

function pickCategoryLabel(
  names: Record<string, string> | undefined,
  locale: EmailLocale,
): string {
  if (!names || typeof names !== "object") return "";
  return (
    names[locale] ??
    names.en ??
    names.tr ??
    (Object.values(names).find((v) => typeof v === "string") as string) ??
    ""
  );
}

function shouldSendEmailForType(
  type: DispatchNotificationType,
  prefs: NotificationPrefsRow | null,
): boolean {
  if (!prefs) return true;

  switch (type) {
    case "new_bid":
      return prefs.email_new_bid !== false;
    case "new_request_match":
      return prefs.email_new_request_match !== false;
    case "bid_accepted":
      return prefs.email_new_message !== false;
    case "message":
      return prefs.email_new_message !== false;
    case "review":
      return prefs.email_new_review !== false;
    case "status_change":
      return prefs.email_new_bid !== false;
    case "verification_approved":
    case "verification_rejected":
    case "bid_rejected":
      return prefs.email_new_bid !== false;
    default:
      return true;
  }
}

function buildLocalizedPath(locale: EmailLocale, path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${p}`;
}

async function buildEmailForType(params: {
  type: DispatchNotificationType;
  data: Record<string, unknown>;
  recipientName: string;
  locale: EmailLocale;
}): Promise<{ subject: string; react: ReactElement } | null> {
  const { type, data, recipientName, locale } = params;

  switch (type) {
    case "new_request_match": {
      const requestId = String(data.requestId ?? "");
      if (!requestId) return null;
      const categoryNames = data.categoryNames as
        | Record<string, string>
        | undefined;
      const categoryName = pickCategoryLabel(categoryNames, locale);
      const copy = getNewRequestMatchCopy(locale);
      return {
        subject: copy.subject,
        react: createElement(NewRequestMatchEmail, {
          recipientName,
          requestTitle: String(data.requestTitle ?? ""),
          customerName: String(data.customerName ?? ""),
          municipality: String(data.municipality ?? ""),
          categoryName,
          isDirect: Boolean(data.is_direct),
          requestUrl: buildLocalizedPath(
            locale,
            `/pro/dashboard/requests/${requestId}`,
          ),
          locale,
        }),
      };
    }
    case "new_bid": {
      const requestId = String(data.requestId ?? "");
      if (!requestId) return null;
      const copy = getNewBidReceivedCopy(locale);
      return {
        subject: copy.subject,
        react: createElement(NewBidReceivedEmail, {
          recipientName,
          professionalName: String(data.professionalName ?? ""),
          requestTitle: String(data.requestTitle ?? ""),
          price: String(data.price ?? ""),
          message: String(data.message ?? ""),
          bidUrl: buildLocalizedPath(
            locale,
            `/dashboard/requests/${requestId}`,
          ),
          locale,
        }),
      };
    }
    case "bid_accepted": {
      const conversationId = String(data.conversationId ?? "");
      if (!conversationId) return null;
      const copy = getBidAcceptedCopy(locale);
      return {
        subject: copy.subject,
        react: createElement(BidAcceptedEmail, {
          recipientName,
          customerName: String(data.customerName ?? ""),
          requestTitle: String(data.requestTitle ?? ""),
          price: String(data.price ?? ""),
          conversationUrl: buildLocalizedPath(
            locale,
            `/inbox/${conversationId}`,
          ),
          locale,
        }),
      };
    }
    default:
      return null;
  }
}

/**
 * Sends transactional email when in-app notification is created (best-effort).
 * Never throws; failures are logged only.
 */
export async function dispatchNotificationEmail(params: {
  userId: string;
  type: string;
  data?: Record<string, unknown>;
  title?: string;
  body?: string;
}): Promise<void> {
  try {
    const type = params.type as DispatchNotificationType;
    const allowed: readonly string[] = [
      "new_request_match",
      "new_bid",
      "bid_accepted",
      "bid_rejected",
      "message",
      "status_change",
      "review",
      "verification_approved",
      "verification_rejected",
    ];
    if (!allowed.includes(type)) return;

    const admin = createAdminClient();

    const { data: authData, error: authErr } =
      await admin.auth.admin.getUserById(params.userId);
    if (authErr || !authData?.user?.email) {
      return;
    }
    const to = authData.user.email.trim();
    if (!to) return;

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, preferred_locale, notification_prefs")
      .eq("id", params.userId)
      .maybeSingle();

    const prefs = (profile?.notification_prefs as NotificationPrefsRow | null) ?? null;
    if (!shouldSendEmailForType(type, prefs)) return;

    const locale = coerceEmailLocale(profile?.preferred_locale ?? undefined);
    const recipientName = profile?.full_name?.trim() || "";

    const mergedData: Record<string, unknown> = {
      ...(params.data ?? {}),
    };
    if (params.title != null) mergedData.notificationTitle = params.title;
    if (params.body != null) mergedData.notificationBody = params.body;

    const emailContent = await buildEmailForType({
      type,
      data: mergedData,
      recipientName,
      locale,
    });

    if (!emailContent) return;

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      react: emailContent.react,
    });

    if (result.ok === false && result.skipped !== true) {
      console.error("[GLATKO-EMAIL] sendEmail failed:", result.error);
    }
  } catch (error) {
    console.error("[GLATKO-EMAIL] dispatchNotificationEmail failed:", error);
  }
}
