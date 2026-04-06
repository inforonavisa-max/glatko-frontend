import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getEmailStrings,
  getReviewReceivedEmailCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type ReviewReceivedEmailProps = {
  recipientName: string;
  rating: number;
  proDashboardUrl: string;
  locale: EmailLocale;
};

export default function ReviewReceivedEmail({
  recipientName,
  rating,
  proDashboardUrl,
  locale,
}: ReviewReceivedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getReviewReceivedEmailCopy(locale);
  const r = Math.min(5, Math.max(1, Math.round(rating)));
  const preview = interpolate(c.previewLine, { stars: String(r) });

  return (
    <EmailLayout preview={preview} locale={locale}>
      <EmailSectionTitle>{c.subject}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {preview}
      </Text>
      <Text className="email-muted m-0 mb-[20px] text-[14px] leading-[22px] text-slate-600">
        {interpolate(c.ratingLine, { stars: String(r) })}
      </Text>
      <EmailPrimaryButton href={proDashboardUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
