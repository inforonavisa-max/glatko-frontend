/**
 * G-AUTH-3: Single React Email component for the 5 transactional auth flows.
 * Reuses the existing brand `EmailLayout` (Tailwind, dark mode, RTL for Arabic).
 *
 * Two visual modes:
 *   1. CTA button (default — recovery, signup, magiclink, email_change)
 *   2. CTA button + prominent OTP code box (reauthentication)
 */
import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import type { EmailLocale } from "@/lib/email/templates/translations";

export type AuthEmailProps = {
  locale: EmailLocale;
  preheader: string;
  heading: string;
  greeting: string;
  intro: string;
  cta: string;
  ctaUrl: string;
  /** Render an OTP code box above the CTA when present (reauth flow). */
  code?: string;
  codeLabel?: string;
  expiry: string;
  ignoreNote: string;
  signature: string;
};

export default function AuthEmail({
  locale,
  preheader,
  heading,
  greeting,
  intro,
  cta,
  ctaUrl,
  code,
  codeLabel,
  expiry,
  ignoreNote,
  signature,
}: AuthEmailProps) {
  return (
    <EmailLayout preview={preheader} locale={locale}>
      <EmailSectionTitle>{heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {greeting}
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {intro}
      </Text>
      {code ? (
        <Section className="email-card mb-[24px] rounded-lg bg-slate-100 px-[16px] py-[20px] text-center">
          {codeLabel ? (
            <Text className="email-muted m-0 mb-[8px] text-[12px] uppercase tracking-[2px] text-slate-500">
              {codeLabel}
            </Text>
          ) : null}
          <Text className="email-text m-0 font-mono text-[28px] font-bold tracking-[6px] text-glatko-primary">
            {code}
          </Text>
        </Section>
      ) : null}
      <EmailPrimaryButton href={ctaUrl}>{cta}</EmailPrimaryButton>
      <Text className="email-muted m-0 mb-[8px] text-center text-[13px] leading-[20px] text-slate-500">
        {expiry}
      </Text>
      <Text className="email-muted m-0 mt-[16px] text-[13px] leading-[20px] text-slate-500">
        {ignoreNote}
      </Text>
      <Text className="email-text m-0 mt-[24px] text-[14px] font-medium text-glatko-dark">
        {signature}
      </Text>
    </EmailLayout>
  );
}
