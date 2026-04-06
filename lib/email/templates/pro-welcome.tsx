import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getEmailStrings,
  getProWelcomeEmailCopy,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type ProWelcomeEmailProps = {
  recipientName: string;
  profileUrl: string;
  dashboardUrl: string;
  adminNote?: string;
  locale: EmailLocale;
};

export default function ProWelcomeEmail({
  recipientName,
  profileUrl,
  dashboardUrl,
  adminNote,
  locale,
}: ProWelcomeEmailProps) {
  const common = getEmailStrings(locale);
  const c = getProWelcomeEmailCopy(locale);
  const namePart = recipientName.trim();

  return (
    <EmailLayout preview={c.preview} locale={locale}>
      <EmailSectionTitle>{c.headline}</EmailSectionTitle>
      <Text className="email-text m-0 mb-[12px] text-[15px] leading-[24px] text-glatko-dark">
        {common.greeting}
        {namePart ? ` ${namePart},` : ","}
      </Text>
      <Text className="email-text m-0 mb-[16px] text-[15px] leading-[24px] text-glatko-dark">
        {c.intro}
      </Text>
      <Section className="mb-[20px]">
        <Text className="email-text m-0 text-[14px] leading-[22px] text-glatko-dark">
          {c.stepMatch}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          {c.stepBid}
        </Text>
        <Text className="email-text m-0 mt-[8px] text-[14px] leading-[22px] text-glatko-dark">
          {c.stepChosen}
        </Text>
      </Section>
      <Text className="email-text m-0 mb-[12px] text-[14px] leading-[22px] text-glatko-dark">
        {c.freeBidLine}
      </Text>
      <Text className="email-text m-0 mb-[20px] text-[14px] leading-[22px] text-glatko-dark">
        {c.supportLine}
      </Text>
      <EmailPrimaryButton href={profileUrl}>{c.ctaProfile}</EmailPrimaryButton>
      <Section className="mt-[16px] text-center">
        <Link
          href={dashboardUrl}
          className="text-[13px] font-medium text-glatko-accent no-underline"
        >
          {common.viewOnPlatform}
        </Link>
      </Section>
      {adminNote ? (
        <Section className="mt-[24px] rounded-lg border border-solid border-slate-200 px-[14px] py-[12px]">
          <Text className="email-muted m-0 mb-[6px] text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            {c.adminNoteLabel}
          </Text>
          <Text className="email-text m-0 whitespace-pre-wrap text-[14px] leading-[22px] text-glatko-dark">
            {adminNote}
          </Text>
        </Section>
      ) : null}
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
