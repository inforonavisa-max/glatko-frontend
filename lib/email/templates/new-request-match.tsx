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
  getNewRequestMatchCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type NewRequestMatchEmailProps = {
  recipientName: string;
  requestTitle: string;
  customerName: string;
  municipality: string;
  categoryName: string;
  isDirect: boolean;
  requestUrl: string;
  locale: EmailLocale;
};

function truncateMessage(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function NewRequestMatchEmail({
  recipientName,
  requestTitle,
  customerName,
  municipality,
  categoryName,
  isDirect,
  requestUrl,
  locale,
}: NewRequestMatchEmailProps) {
  const common = getEmailStrings(locale);
  const c = getNewRequestMatchCopy(locale);
  const bodyTemplate = isDirect ? c.directBody : c.indirectBody;
  const body = interpolate(bodyTemplate, { customerName });

  const preview = c.headline;

  return (
    <EmailLayout preview={preview} locale={locale}>
      <EmailSectionTitle>{c.headline}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {body}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.labelService}:</strong>{" "}
          {categoryName}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.labelLocation}:</strong>{" "}
          {municipality}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.labelRequest}:</strong>{" "}
          {truncateMessage(requestTitle, 200)}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={requestUrl}>{c.cta}</EmailPrimaryButton>
      <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
        {c.closingTip}
      </Text>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
