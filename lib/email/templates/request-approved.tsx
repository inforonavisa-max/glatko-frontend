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
  getRequestApprovedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type RequestApprovedEmailProps = {
  locale: EmailLocale;
  categoryName: string;
  city: string;
  proCount: number;
  requestUrl: string;
};

export default function RequestApprovedEmail({
  locale,
  categoryName,
  city,
  proCount,
  requestUrl,
}: RequestApprovedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getRequestApprovedCopy(locale);

  const proLine =
    proCount === 0
      ? c.noProsHint
      : proCount === 1
        ? c.proCountSingular
        : interpolate(c.proCountPlural, { count: String(proCount) });

  const body = interpolate(c.body, {
    category: categoryName,
    city,
    proLine,
  });

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">Glatko</strong>
        </Text>
        <Text className="email-muted m-0 mt-[4px] text-[12px] leading-[18px]">
          {common.tagline}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={requestUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
