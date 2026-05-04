import * as React from "react";

import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import { getAdminRequestsUrl } from "@/lib/admin/config";
import {
  coerceEmailLocale,
  getAdminPendingRequestCopy,
  getRequestApprovedCopy,
  getRequestRejectedCopy,
} from "@/lib/email/templates/translations";
import AdminPendingRequestEmail from "@/lib/email/templates/admin-pending-request";
import RequestApprovedEmail from "@/lib/email/templates/request-approved";
import RequestRejectedEmail from "@/lib/email/templates/request-rejected";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

/**
 * G-REQ-1 transactional email helpers.
 *
 * These are intentionally thin wrappers over `sendEmail` (no quiet-hours,
 * no daily cap, no notification-pref lookup). The semantics are:
 *
 *   - Admin pending alerts go to a hardcoded ops mailbox list and must
 *     fire promptly, regardless of any user-pref toggles.
 *   - User approve/reject mailers are a direct response to an admin
 *     action; they're transactional and the Upstash 10/hr limiter is
 *     enough rate guard.
 */

const ADMIN_RECIPIENTS = [
  "info@glatko.app",
  "info@ronalegal.com",
] as const;

const ADMIN_EMAIL_CONTENT_LOCALE = "en"; // ops mailbox reads English

/* ─── Admin: pending-request alert ──────────────────────────────────── */

interface AdminPendingArgs {
  requestId: string;
  categoryName: string;
  city: string;
  requestorEmail: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null;
}

export async function sendAdminPendingRequestEmail(
  args: AdminPendingArgs,
): Promise<void> {
  const copy = getAdminPendingRequestCopy(ADMIN_EMAIL_CONTENT_LOCALE);
  const adminPanelUrl = getAdminRequestsUrl();
  const requestIdShort = args.requestId.slice(0, 8);

  const subject = `${copy.subject} — ${args.categoryName} (${args.city})`;
  const reactBase: Parameters<typeof AdminPendingRequestEmail>[0] = {
    locale: ADMIN_EMAIL_CONTENT_LOCALE,
    categoryName: args.categoryName,
    city: args.city,
    requestorEmail: args.requestorEmail,
    budgetMin: args.budgetMin,
    budgetMax: args.budgetMax,
    preferredDate: args.preferredDate,
    adminPanelUrl,
    requestIdShort,
  };

  await Promise.all(
    ADMIN_RECIPIENTS.map(async (to) => {
      try {
        await sendEmail({
          to,
          subject,
          react: React.createElement(AdminPendingRequestEmail, reactBase),
          tags: [
            { name: "category", value: "request" },
            { name: "type", value: "admin_pending" },
          ],
          headers: {
            "X-Glatko-Email-Type": "admin-pending-notification",
            "X-Entity-Ref-ID": args.requestId,
          },
        });
      } catch (err) {
        glatkoCaptureException(err, {
          module: "request-emails",
          op: "admin_pending",
          recipient: to,
          requestId: args.requestId,
        });
      }
    }),
  );
}

/* ─── User: approve mailer ──────────────────────────────────────────── */

interface ApprovedArgs {
  to: string;
  locale: string;
  categoryName: string;
  city: string;
  proCount: number;
  /** When set, links to the user's request detail; otherwise a list page. */
  requestUrl?: string;
}

export async function sendRequestApprovedEmail(
  args: ApprovedArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getRequestApprovedCopy(locale);
  const requestUrl =
    args.requestUrl ?? `${getSiteUrl()}/${locale}/dashboard/requests`;

  try {
    await sendEmail({
      to: args.to,
      subject: copy.subject,
      react: React.createElement(RequestApprovedEmail, {
        locale,
        categoryName: args.categoryName,
        city: args.city,
        proCount: args.proCount,
        requestUrl,
      }),
      tags: [
        { name: "category", value: "request" },
        { name: "type", value: "approved" },
      ],
      headers: {
        "X-Glatko-Email-Type": "request-approved",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "request-emails",
      op: "approved",
      recipient: args.to,
    });
  }
}

/* ─── User: reject mailer ───────────────────────────────────────────── */

interface RejectedArgs {
  to: string;
  locale: string;
  categoryName: string;
  city: string;
  rejectReason: string;
}

export async function sendRequestRejectedEmail(
  args: RejectedArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getRequestRejectedCopy(locale);
  const newRequestUrl = `${getSiteUrl()}/${locale}/request-service`;

  try {
    await sendEmail({
      to: args.to,
      subject: copy.subject,
      react: React.createElement(RequestRejectedEmail, {
        locale,
        categoryName: args.categoryName,
        city: args.city,
        rejectReason: args.rejectReason,
        newRequestUrl,
      }),
      tags: [
        { name: "category", value: "request" },
        { name: "type", value: "rejected" },
      ],
      headers: {
        "X-Glatko-Email-Type": "request-rejected",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "request-emails",
      op: "rejected",
      recipient: args.to,
    });
  }
}
