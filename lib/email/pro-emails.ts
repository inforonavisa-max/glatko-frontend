import * as React from "react";

import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import { getAdminProfessionalsUrl } from "@/lib/admin/config";
import {
  coerceEmailLocale,
  getAdminProApplicationCopy,
  getProApprovedCopy,
  getProRejectedCopy,
} from "@/lib/email/templates/translations";
import AdminProApplicationEmail from "@/lib/email/templates/admin-pro-application";
import ProApprovedEmail from "@/lib/email/templates/pro-approved";
import ProRejectedEmail from "@/lib/email/templates/pro-rejected";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

/**
 * G-PRO-1 transactional email helpers.
 *
 * Same shape as G-REQ-1's request-emails.ts: thin wrappers around sendEmail
 * (no quiet-hours, no daily cap). Admin alerts go to a hardcoded ops mailbox
 * list and fire promptly. User approve/reject mailers respond to admin
 * actions; the Upstash 10/hr/recipient limiter is sufficient rate guard.
 */

const ADMIN_RECIPIENTS = [
  "info@glatko.app",
  "info@ronalegal.com",
] as const;

const ADMIN_EMAIL_CONTENT_LOCALE = "en";

/* ─── Admin: pro application alert ──────────────────────────────────── */

interface AdminProApplicationArgs {
  professionalId: string;
  professionalName: string;
  professionalEmail: string;
  city: string;
  serviceLabels: string[];
  completionScore: number;
}

export async function sendAdminProApplicationEmail(
  args: AdminProApplicationArgs,
): Promise<void> {
  const copy = getAdminProApplicationCopy(ADMIN_EMAIL_CONTENT_LOCALE);
  const adminPanelUrl = getAdminProfessionalsUrl();
  const proIdShort = args.professionalId.slice(0, 8);

  const subject = `${copy.subject} — ${args.professionalName} (${args.city})`;
  const reactBase: Parameters<typeof AdminProApplicationEmail>[0] = {
    locale: ADMIN_EMAIL_CONTENT_LOCALE,
    professionalName: args.professionalName,
    professionalEmail: args.professionalEmail,
    city: args.city,
    serviceLabels: args.serviceLabels,
    completionScore: args.completionScore,
    adminPanelUrl,
    proIdShort,
  };

  await Promise.all(
    ADMIN_RECIPIENTS.map(async (to) => {
      try {
        await sendEmail({
          to,
          subject,
          react: React.createElement(AdminProApplicationEmail, reactBase),
          tags: [
            { name: "category", value: "pro" },
            { name: "type", value: "admin_pending" },
          ],
          headers: {
            "X-Glatko-Email-Type": "admin-pro-application",
            "X-Entity-Ref-ID": args.professionalId,
          },
        });
      } catch (err) {
        glatkoCaptureException(err, {
          module: "pro-emails",
          op: "admin_pending",
          recipient: to,
          professionalId: args.professionalId,
        });
      }
    }),
  );
}

/* ─── User: approve mailer ──────────────────────────────────────────── */

interface ProApprovedArgs {
  to: string;
  locale: string;
  professionalName: string;
  dashboardUrl?: string;
}

export async function sendProApprovedEmail(
  args: ProApprovedArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getProApprovedCopy(locale);
  const dashboardUrl =
    args.dashboardUrl ?? `${getSiteUrl()}/${locale}/pro/dashboard`;

  try {
    await sendEmail({
      to: args.to,
      subject: copy.subject,
      react: React.createElement(ProApprovedEmail, {
        locale,
        professionalName: args.professionalName,
        dashboardUrl,
      }),
      tags: [
        { name: "category", value: "pro" },
        { name: "type", value: "approved" },
      ],
      headers: {
        "X-Glatko-Email-Type": "pro-approved",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "pro-emails",
      op: "approved",
      recipient: args.to,
    });
  }
}

/* ─── User: reject mailer ───────────────────────────────────────────── */

interface ProRejectedArgs {
  to: string;
  locale: string;
  professionalName: string;
  rejectReason: string;
}

export async function sendProRejectedEmail(
  args: ProRejectedArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getProRejectedCopy(locale);
  const supportUrl = `${getSiteUrl()}/${locale}/contact`;

  try {
    await sendEmail({
      to: args.to,
      subject: copy.subject,
      react: React.createElement(ProRejectedEmail, {
        locale,
        professionalName: args.professionalName,
        rejectReason: args.rejectReason,
        supportUrl,
      }),
      tags: [
        { name: "category", value: "pro" },
        { name: "type", value: "rejected" },
      ],
      headers: {
        "X-Glatko-Email-Type": "pro-rejected",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "pro-emails",
      op: "rejected",
      recipient: args.to,
    });
  }
}
