import { Section, Text } from "@react-email/components";
import * as React from "react";
import {
  EmailLayout,
  EmailPrimaryButton,
  EmailSectionTitle,
} from "@/lib/email/templates/email-layout";
import {
  getCompleteProfileReminderCopy,
  getEmailStrings,
  type EmailLocale,
} from "@/lib/email/templates/translations";

export type CompleteProfileEmailProps = {
  recipientName: string;
  profileUrl: string;
  locale: EmailLocale;
  missingAvatar: boolean;
  missingPhone: boolean;
  missingName: boolean;
};

export default function CompleteProfileEmail({
  recipientName,
  profileUrl,
  locale,
  missingAvatar,
  missingPhone,
  missingName,
}: CompleteProfileEmailProps) {
  const common = getEmailStrings(locale);
  const c = getCompleteProfileReminderCopy(locale);
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
        <Text className="email-text m-0 mb-[8px] text-[14px] font-medium leading-[22px] text-glatko-dark">
          {c.listTitle}
        </Text>
        {missingAvatar ? (
          <Text className="email-text m-0 text-[14px] leading-[22px] text-glatko-dark">
            • {c.itemAvatar}
          </Text>
        ) : null}
        {missingPhone ? (
          <Text className="email-text m-0 mt-[6px] text-[14px] leading-[22px] text-glatko-dark">
            • {c.itemPhone}
          </Text>
        ) : null}
        {missingName ? (
          <Text className="email-text m-0 mt-[6px] text-[14px] leading-[22px] text-glatko-dark">
            • {c.itemName}
          </Text>
        ) : null}
      </Section>
      <EmailPrimaryButton href={profileUrl}>{c.cta}</EmailPrimaryButton>
      <Section className="mt-[24px]">
        <Text className="email-muted m-0 text-[13px] text-slate-500">
          {common.regards}
        </Text>
      </Section>
    </EmailLayout>
  );
}
