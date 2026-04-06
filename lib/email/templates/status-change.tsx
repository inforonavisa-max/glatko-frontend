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
  getStatusChangeEmailCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type StatusChangeEmailProps = {
  recipientName: string;
  requestTitle: string;
  detailText: string;
  requestUrl: string;
  locale: EmailLocale;
};

export default function StatusChangeEmail({
  recipientName,
  requestTitle,
  detailText,
  requestUrl,
  locale,
}: StatusChangeEmailProps) {
  const common = getEmailStrings(locale);
  const c = getStatusChangeEmailCopy(locale);

  return (
    <EmailLayout preview={detailText.slice(0, 120)} locale={locale}>
      <EmailSectionTitle>{c.subject}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[16px] text-[15px] leading-[24px] text-glatko-dark">
        {c.headline}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.requestLabel}:</strong>{" "}
          {requestTitle.trim() || "—"}
        </Text>
        <Text className="email-muted m-0 mt-[10px] text-[13px] leading-[20px]">
          {detailText}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={requestUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
