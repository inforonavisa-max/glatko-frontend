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
  getProRejectedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type ProRejectedEmailProps = {
  locale: EmailLocale;
  professionalName: string;
  rejectReason: string;
  supportUrl: string;
};

export default function ProRejectedEmail({
  locale,
  professionalName,
  rejectReason,
  supportUrl,
}: ProRejectedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getProRejectedCopy(locale);
  const intro = interpolate(c.intro, { name: professionalName });

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {intro}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] font-semibold leading-[20px] text-glatko-dark">
          {c.reasonLabel}
        </Text>
        <Text className="email-muted m-0 mt-[6px] whitespace-pre-wrap text-[13px] leading-[20px]">
          {rejectReason}
        </Text>
      </EmailInfoCard>
      <Text className="email-text m-0 mb-[20px] mt-[16px] text-[14px] leading-[22px] text-glatko-dark">
        {c.outro}
      </Text>
      <EmailPrimaryButton href={supportUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
