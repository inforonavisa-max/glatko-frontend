import { Section, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailInfoCard,
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getEmailStrings,
  getProApprovedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type ProApprovedEmailProps = {
  locale: EmailLocale;
  professionalName: string;
  dashboardUrl: string;
};

export default function ProApprovedEmail({
  locale,
  professionalName,
  dashboardUrl,
}: ProApprovedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getProApprovedCopy(locale);
  const body = interpolate(c.body, { name: professionalName });

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] font-semibold leading-[20px] text-glatko-dark">
          {c.nextStepsTitle}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          1. {c.step1}
        </Text>
        <Text className="email-muted m-0 mt-[6px] text-[13px] leading-[20px]">
          2. {c.step2}
        </Text>
        <Text className="email-muted m-0 mt-[6px] text-[13px] leading-[20px]">
          3. {c.step3}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={dashboardUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
