import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getEmailStrings,
  getWelcomeCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type WelcomeEmailProps = {
  recipientName: string;
  isProfessional: boolean;
  dashboardUrl: string;
  locale: EmailLocale;
};

export default function WelcomeEmail({
  recipientName,
  isProfessional,
  dashboardUrl,
  locale,
}: WelcomeEmailProps) {
  const common = getEmailStrings(locale);
  const c = getWelcomeCopy(locale);
  const body = isProfessional ? c.proBody : c.customerBody;
  const cta = isProfessional ? c.ctaPro : c.ctaCustomer;

  return (
    <EmailLayout preview={c.title} locale={locale}>
      <EmailSectionTitle>{c.title}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[24px] text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <Section className="mb-[20px]">
        <Text className="email-text m-0 text-[14px] leading-[22px] text-glatko-dark">
          • {c.bullet1}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          • {c.bullet2}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          • {c.bullet3}
        </Text>
      </Section>
      <EmailPrimaryButton href={dashboardUrl}>{cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
