import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getCustomerWelcomeEmailCopy,
  getEmailStrings,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type WelcomeEmailProps = {
  recipientName: string;
  requestServiceUrl: string;
  becomeProUrl: string;
  locale: EmailLocale;
};

export default function WelcomeEmail({
  recipientName,
  requestServiceUrl,
  becomeProUrl,
  locale,
}: WelcomeEmailProps) {
  const common = getEmailStrings(locale);
  const c = getCustomerWelcomeEmailCopy(locale);
  const namePart = recipientName.trim();

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.title}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting}
        {namePart ? ` ${namePart},` : ","}
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {c.whatIsGlatko}
      </Text>
      <Section className="mb-[20px]">
        <Text className="email-text m-0 text-[14px] leading-[22px] text-glatko-dark">
          {c.step1}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          {c.step2}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          {c.step3}
        </Text>
      </Section>
      <EmailPrimaryButton href={requestServiceUrl}>{c.ctaPrimary}</EmailPrimaryButton>
      <Section className="mt-[8px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {c.proFooter}{" "}
          <Link href={becomeProUrl} className="text-glatko-primary no-underline">
            {c.proLinkLabel}
          </Link>
        </Text>
      </Section>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
