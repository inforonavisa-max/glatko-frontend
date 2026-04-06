import { createElement, type ReactElement } from "react";
import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import { pickLocalizedLabel } from "@/lib/i18n/pick-localized-label";
import type { EmailLocale } from "@/lib/email/templates/translations";
import {
  getBidAcceptedCopy,
  getBidNotSelectedCopy,
  getNewBidReceivedCopy,
  getNewMessageEmailCopy,
  getNewRequestMatchCopy,
  getReviewReceivedEmailCopy,
  getStatusChangeEmailCopy,
  getVerificationApprovedEmailCopy,
  getVerificationRejectedEmailCopy,
} from "@/lib/email/templates/translations";
import BidAcceptedEmail from "@/lib/email/templates/bid-accepted";
import BidRejectedEmail from "@/lib/email/templates/bid-rejected";
import NewBidReceivedEmail from "@/lib/email/templates/new-bid-received";
import NewRequestMatchEmail from "@/lib/email/templates/new-request-match";
import ReviewReceivedEmail from "@/lib/email/templates/review-received";
import SimpleActionEmail from "@/lib/email/templates/simple-action-email";
import StatusChangeEmail from "@/lib/email/templates/status-change";
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
      const requestId = String(data.requestId ?? data.request_id ?? "");
      if (!requestId) return null;
      const categoryNames =
        (data.categoryNames as Record<string, string> | undefined) ?? {};
      const categoryName = pickLocalizedLabel(categoryNames, locale);
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
      const requestId = String(data.requestId ?? data.request_id ?? "");
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
      const conversationId = String(
        data.conversationId ?? data.conversation_id ?? "",
      );
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
    case "bid_rejected": {
      const categoryNames =
        (data.categoryNames as Record<string, string> | undefined) ?? {};
      const categoryName = pickLocalizedLabel(categoryNames, locale);
      const copy = getBidNotSelectedCopy(locale);
      return {
        subject: copy.subject,
        react: createElement(BidRejectedEmail, {
          recipientName,
          requestTitle: String(data.requestTitle ?? ""),
          categoryName,
          municipality: String(data.municipality ?? ""),
          matchingUrl: buildLocalizedPath(locale, "/pro/dashboard/requests"),
          locale,
        }),
      };
    }
    case "status_change": {
      const detailText = String(data.notificationBody ?? "").trim();
      if (!detailText) return null;
      const requestId = String(data.requestId ?? data.request_id ?? "");
      const requestTitle = String(data.requestTitle ?? "");
      const copy = getStatusChangeEmailCopy(locale);
      const requestUrl = requestId
        ? buildLocalizedPath(locale, `/dashboard/requests/${requestId}`)
        : buildLocalizedPath(locale, "/dashboard");
      return {
        subject: copy.subject,
        react: createElement(StatusChangeEmail, {
          recipientName,
          requestTitle,
          detailText,
          requestUrl,
          locale,
        }),
      };
    }
    case "review": {
      const rating = Number(data.overallRating ?? data.rating ?? 5);
      const copy = getReviewReceivedEmailCopy(locale);
      return {
        subject: copy.subject,
        react: createElement(ReviewReceivedEmail, {
          recipientName,
          rating: Number.isFinite(rating) ? rating : 5,
          proDashboardUrl: buildLocalizedPath(locale, "/pro/dashboard"),
          locale,
        }),
      };
    }
    case "message": {
      const conversationId = String(
        data.conversationId ?? data.conversation_id ?? "",
      );
      const m = getNewMessageEmailCopy(locale);
      const body = String(data.notificationBody ?? "").trim() || "—";
      const ctaUrl = conversationId
        ? buildLocalizedPath(locale, `/inbox/${conversationId}`)
        : buildLocalizedPath(locale, "/inbox");
      return {
        subject: m.subject,
        react: createElement(SimpleActionEmail, {
          recipientName,
          preview: body.slice(0, 100),
          title: m.title,
          body,
          ctaLabel: m.cta,
          ctaUrl,
          locale,
        }),
      };
    }
    case "verification_approved": {
      const c = getVerificationApprovedEmailCopy(locale);
      const extra = String(data.notificationBody ?? "").trim();
      const body = extra ? `${c.body}\n\n${extra}` : c.body;
      return {
        subject: c.subject,
        react: createElement(SimpleActionEmail, {
          recipientName,
          preview: c.body,
          title: c.title,
          body,
          ctaLabel: c.cta,
          ctaUrl: buildLocalizedPath(locale, "/pro/dashboard"),
          locale,
        }),
      };
    }
    case "verification_rejected": {
      const c = getVerificationRejectedEmailCopy(locale);
      const extra = String(data.notificationBody ?? "").trim();
      const body = extra ? `${c.body}\n\n${extra}` : c.body;
      return {
        subject: c.subject,
        react: createElement(SimpleActionEmail, {
          recipientName,
          preview: c.subject,
          title: c.title,
          body,
          ctaLabel: c.cta,
          ctaUrl: buildLocalizedPath(locale, "/pro/dashboard/profile"),
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
    console.log("[GLATKO-EMAIL] dispatch called:", {
      userId: params.userId,
      type: params.type,
    });

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
    if (!allowed.includes(type)) {
      console.log("[GLATKO-EMAIL] type not in allowed list:", type);
      return;
    }

    const admin = createAdminClient();

    const { data: authData, error: authErr } =
      await admin.auth.admin.getUserById(params.userId);
    if (authErr || !authData?.user?.email) {
      console.error("[GLATKO-EMAIL] getUserById failed:", {
        authErr,
        hasUser: !!authData?.user,
      });
      return;
    }
    const to = authData.user.email.trim();
    if (!to) {
      console.log("[GLATKO-EMAIL] recipient email empty after trim");
      return;
    }
    console.log("[GLATKO-EMAIL] recipient email:", to);

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, preferred_locale, notification_prefs")
      .eq("id", params.userId)
      .maybeSingle();

    const prefs = (profile?.notification_prefs as NotificationPrefsRow | null) ?? null;
    if (!shouldSendEmailForType(type, prefs)) {
      console.log(
        "[GLATKO-EMAIL] email disabled by user prefs for type:",
        type,
      );
      return;
    }

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

    if (!emailContent) {
      console.log("[GLATKO-EMAIL] no template for type:", type);
      return;
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      react: emailContent.react,
    });

    console.log("[GLATKO-EMAIL] sendEmail result:", {
      success: result.success,
      messageId: result.success ? result.messageId : undefined,
      error: result.success ? undefined : result.error,
    });

    if (!result.success) {
      console.error("[GLATKO-EMAIL] sendEmail failed:", result.error);
    }
  } catch (error) {
    console.error("[GLATKO-EMAIL] dispatchNotificationEmail failed:", error);
  }
}
