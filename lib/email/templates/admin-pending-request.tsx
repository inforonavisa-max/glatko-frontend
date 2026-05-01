import { Section, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailInfoCard,
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getAdminPendingRequestCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type AdminPendingRequestEmailProps = {
  locale: EmailLocale;
  categoryName: string;
  city: string;
  requestorEmail: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredDate: string | null;
  adminPanelUrl: string;
  requestIdShort: string;
};

export default function AdminPendingRequestEmail({
  locale,
  categoryName,
  city,
  requestorEmail,
  budgetMin,
  budgetMax,
  preferredDate,
  adminPanelUrl,
  requestIdShort,
}: AdminPendingRequestEmailProps) {
  const c = getAdminPendingRequestCopy(locale);
  const budgetText =
    budgetMin || budgetMax ? `€${budgetMin ?? "?"} – €${budgetMax ?? "?"}` : null;

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {c.intro}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.categoryLabel}:</strong>{" "}
          {categoryName}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.cityLabel}:</strong> {city}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.requestorLabel}:</strong>{" "}
          {requestorEmail}
        </Text>
        {budgetText ? (
          <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
            <strong className="text-glatko-dark">{c.budgetLabel}:</strong>{" "}
            {budgetText}
          </Text>
        ) : null}
        {preferredDate ? (
          <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
            <strong className="text-glatko-dark">{c.dateLabel}:</strong>{" "}
            {preferredDate}
          </Text>
        ) : null}
      </EmailInfoCard>
      <EmailPrimaryButton href={adminPanelUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[12px] leading-[18px] text-slate-400">
          {c.footer} · #{requestIdShort}
        </Text>
      </Section>
    </EmailLayout>
  );
}
