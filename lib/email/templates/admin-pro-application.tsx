import { Section, Text } from "@react-email/components";
import * as React from "react";

import {
  EmailInfoCard,
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getAdminProApplicationCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type AdminProApplicationEmailProps = {
  locale: EmailLocale;
  professionalName: string;
  professionalEmail: string;
  city: string;
  serviceLabels: string[];
  completionScore: number;
  adminPanelUrl: string;
  proIdShort: string;
};

export default function AdminProApplicationEmail({
  locale,
  professionalName,
  professionalEmail,
  city,
  serviceLabels,
  completionScore,
  adminPanelUrl,
  proIdShort,
}: AdminProApplicationEmailProps) {
  const c = getAdminProApplicationCopy(locale);
  const servicesText = serviceLabels.join(", ");

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.heading}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[20px] text-[15px] leading-[24px] text-glatko-dark">
        {c.intro}
      </Text>
      <EmailInfoCard>
        <Text className="email-muted m-0 text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.professionalLabel}:</strong>{" "}
          {professionalName}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.emailLabel}:</strong>{" "}
          {professionalEmail}
        </Text>
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.cityLabel}:</strong> {city}
        </Text>
        {servicesText ? (
          <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
            <strong className="text-glatko-dark">{c.servicesLabel}:</strong>{" "}
            {servicesText}
          </Text>
        ) : null}
        <Text className="email-muted m-0 mt-[8px] text-[13px] leading-[20px]">
          <strong className="text-glatko-dark">{c.completionLabel}:</strong>{" "}
          {completionScore}%
        </Text>
      </EmailInfoCard>
      <EmailPrimaryButton href={adminPanelUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[12px] leading-[18px] text-slate-400">
          #{proIdShort}
        </Text>
      </Section>
    </EmailLayout>
  );
}
