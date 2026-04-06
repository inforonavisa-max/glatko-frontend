import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import { getEmailStrings, type EmailLocale } from "@/lib/email/templates/translations";

export type SimpleActionEmailProps = {
  recipientName: string;
  preview: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  locale: EmailLocale;
};

export default function SimpleActionEmail({
  recipientName,
  preview,
  title,
  body,
  ctaLabel,
  ctaUrl,
  locale,
}: SimpleActionEmailProps) {
  const common = getEmailStrings(locale);
  return (
    <EmailLayout preview={preview} locale={locale}>
      <EmailSectionTitle>{title}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] whitespace-pre-wrap text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <EmailPrimaryButton href={ctaUrl}>{ctaLabel}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
