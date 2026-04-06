import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailInfoCard,
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getBidNotSelectedCopy,
  getEmailStrings,
  interpolate,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type BidRejectedEmailProps = {
  recipientName: string;
  requestTitle: string;
  categoryName: string;
  municipality: string;
  matchingUrl: string;
  locale: EmailLocale;
};

export default function BidRejectedEmail({
  recipientName,
  requestTitle,
  categoryName,
  municipality,
  matchingUrl,
  locale,
}: BidRejectedEmailProps) {
  const common = getEmailStrings(locale);
  const c = getBidNotSelectedCopy(locale);
  const titleLine = requestTitle.trim() || c.fallbackRequest;

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.subject}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting} {recipientName},
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {interpolate(c.bodyLine, { requestTitle: titleLine })}
      </Text>
      {(categoryName || municipality) && (
        <EmailInfoCard>
          {categoryName ? (
            <Text className="email-muted m-0 text-[13px] leading-[20px]">
              <strong className="text-glatko-dark">{c.serviceLabel}:</strong>{" "}
              {categoryName}
            </Text>
          ) : null}
          {municipality ? (
            <Text
              className={`email-muted m-0 text-[13px] leading-[20px] ${categoryName ? "mt-[8px]" : ""}`}
            >
              <strong className="text-glatko-dark">{c.locationLabel}:</strong>{" "}
              {municipality}
            </Text>
          ) : null}
        </EmailInfoCard>
      )}
      <Text className="email-muted m-0 mb-[20px] text-[13px] leading-[20px] text-slate-500">
        {c.tip}
      </Text>
      <EmailPrimaryButton href={matchingUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
