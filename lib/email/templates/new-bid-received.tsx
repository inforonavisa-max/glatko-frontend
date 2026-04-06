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
  getNewBidReceivedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type NewBidReceivedEmailProps = {
  recipientName: string;
  professionalName: string;
  requestTitle: string;
  price: string;
  message: string;
  bidUrl: string;
  locale: EmailLocale;
};

function truncateMessage(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default function NewBidReceivedEmail({
  recipientName,
  professionalName,
  requestTitle,
  price,
  message,
  bidUrl,
  locale,
}: NewBidReceivedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getNewBidReceivedCopy(locale);
  const open = interpolate(c.openLine, { professionalName });

  return (
    <EmailLayout preview={open} locale={locale}>
      <EmailSectionTitle>{c.subject}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {open}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.requestLabel}:</strong>{" "}
          {requestTitle}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.priceLabel}:</strong> {price}{" "}
          €
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.messageLabel}:</strong>{" "}
          {truncateMessage(message, 200)}
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={bidUrl}>{c.cta}</EmailPrimaryButton>
      <Text className="email-muted m-0 text-[13px] leading-[20px] text-slate-500">
        {c.note}
      </Text>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
