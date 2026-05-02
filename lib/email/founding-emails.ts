import * as React from "react";

import { sendEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/email/resend";
import {
  coerceEmailLocale,
  getFoundingProviderWelcomeCopy,
  getFoundingCustomerWelcomeCopy,
  interpolate,
} from "@/lib/email/templates/translations";
import FoundingProviderWelcomeEmail from "@/lib/email/templates/founding-provider-welcome";
import FoundingCustomerWelcomeEmail from "@/lib/email/templates/founding-customer-welcome";
import { glatkoCaptureException } from "@/lib/sentry/glatko-capture";

/**
 * G-LAUNCH-1 transactional email helpers for the Founding programs.
 *
 * Mirrors request-emails.ts / pro-emails.ts (G-REQ-1, G-PRO-1) — thin
 * wrappers over sendEmail. Founding emails are fired AFTER the regular
 * approve/welcome mailer (so the user receives both, with the founding
 * one as the celebratory follow-up).
 *
 * Integration points:
 *   - Pro side: admin/professionals/actions.ts approve flow checks
 *     glatko_professional_profiles.is_founding_provider after the trigger
 *     runs and calls sendFoundingProviderWelcomeEmail when true.
 *     [WIRED IN A POST-PR-#15 FOLLOW-UP COMMIT — this file is ready.]
 *   - Customer side: app/[locale]/request-service/actions.ts
 *     submitServiceRequest fires sendFoundingCustomerWelcomeEmail when
 *     glatko_check_founding_customer returns true (first-100 promotion).
 */

interface FoundingProviderArgs {
  to: string;
  locale: string;
  professionalName: string;
  foundingNumber: number;
  dashboardUrl?: string;
}

export async function sendFoundingProviderWelcomeEmail(
  args: FoundingProviderArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getFoundingProviderWelcomeCopy(locale);
  const subject = interpolate(copy.subject, {
    number: String(args.foundingNumber),
  });
  const dashboardUrl =
    args.dashboardUrl ?? `${getSiteUrl()}/${locale}/pro/dashboard`;

  try {
    await sendEmail({
      to: args.to,
      subject,
      react: React.createElement(FoundingProviderWelcomeEmail, {
        locale,
        professionalName: args.professionalName,
        foundingNumber: args.foundingNumber,
        dashboardUrl,
      }),
      tags: [
        { name: "category", value: "launch" },
        { name: "type", value: "founding_provider_welcome" },
      ],
      headers: {
        "X-Glatko-Email-Type": "founding-provider-welcome",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "founding-emails",
      op: "founding_provider_welcome",
      recipient: args.to,
    });
  }
}

interface FoundingCustomerArgs {
  to: string;
  locale: string;
  customerName: string;
  foundingNumber: number;
  servicesUrl?: string;
}

export async function sendFoundingCustomerWelcomeEmail(
  args: FoundingCustomerArgs,
): Promise<void> {
  const locale = coerceEmailLocale(args.locale);
  const copy = getFoundingCustomerWelcomeCopy(locale);
  const subject = interpolate(copy.subject, {
    number: String(args.foundingNumber),
  });
  const servicesUrl =
    args.servicesUrl ?? `${getSiteUrl()}/${locale}/services`;

  try {
    await sendEmail({
      to: args.to,
      subject,
      react: React.createElement(FoundingCustomerWelcomeEmail, {
        locale,
        customerName: args.customerName,
        foundingNumber: args.foundingNumber,
        servicesUrl,
      }),
      tags: [
        { name: "category", value: "launch" },
        { name: "type", value: "founding_customer_welcome" },
      ],
      headers: {
        "X-Glatko-Email-Type": "founding-customer-welcome",
      },
    });
  } catch (err) {
    glatkoCaptureException(err, {
      module: "founding-emails",
      op: "founding_customer_welcome",
      recipient: args.to,
    });
  }
}
