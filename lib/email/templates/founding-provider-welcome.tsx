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
  getFoundingProviderWelcomeCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type FoundingProviderWelcomeEmailProps = {
  locale: EmailLocale;
  professionalName: string;
  foundingNumber: number;
  dashboardUrl: string;
};

export default function FoundingProviderWelcomeEmail({
  locale,
  professionalName,
  foundingNumber,
  dashboardUrl,
}: FoundingProviderWelcomeEmailProps) {
  const common = getEmailStrings(locale);
  const c = getFoundingProviderWelcomeCopy(locale);
  const subject = interpolate(c.subject, { number: String(foundingNumber) });
  const body = interpolate(c.body, { name: professionalName });

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] font-semibold leading-[20px] text-glatko-dark">
          {c.perksTitle}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          ★ {c.perk1}
        </Text>
        <Text className="email-muted m-0 mt-[6px] text-[13px] leading-[20px]">
          ★ {c.perk2}
        </Text>
        <Text className="email-muted m-0 mt-[6px] text-[13px] leading-[20px]">
          ★ {c.perk3}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={dashboardUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {common.regards}
        </Text>
        <Text className="email-muted m-0 mt-[4px] text-[12px] leading-[18px] text-slate-400">
          {subject}
        </Text>
      </Section>
    </EmailLayout>
  );
}
