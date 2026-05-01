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
  getRequestRejectedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type RequestRejectedEmailProps = {
  locale: EmailLocale;
  categoryName: string;
  city: string;
  rejectReason: string;
  newRequestUrl: string;
};

export default function RequestRejectedEmail({
  locale,
  categoryName,
  city,
  rejectReason,
  newRequestUrl,
}: RequestRejectedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getRequestRejectedCopy(locale);

  const intro = interpolate(c.intro, { category: categoryName, city });

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {intro}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[12px] uppercase tracking-wide text-slate-500">
          {c.reasonLabel}
        </Text>
        <Text className="email-text m-0 mt-[6px] text-[14px] leading-[22px] text-glatko-dark">
          {rejectReason}
        </Text>
      </EmailInfoCard>
      <Text className="email-muted m-0 mb-[20px] mt-[16px] text-[14px] leading-[22px] text-slate-600">
        {c.outro}
      </Text>
      <EmailPrimaryButton href={newRequestUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
