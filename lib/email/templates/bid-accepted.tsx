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
  getBidAcceptedCopy,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type BidAcceptedEmailProps = {
  recipientName: string;
  customerName: string;
  requestTitle: string;
  price: string;
  conversationUrl: string;
  locale: EmailLocale;
};

export default function BidAcceptedEmail({
  recipientName,
  customerName,
  requestTitle,
  price,
  conversationUrl,
  locale,
}: BidAcceptedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getBidAcceptedCopy(locale);
  const accepted = interpolate(c.acceptedLine, { customerName });

  return (
    <EmailLayout preview={c.celebration} locale={locale}>
      <EmailSectionTitle>{c.celebration}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {accepted}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.serviceLabel}:</strong>{" "}
          {requestTitle}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.priceLabel}:</strong> {price}{" "}
          €
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={conversationUrl}>{c.cta}</EmailPrimaryButton>
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
