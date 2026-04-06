import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind, pixelBasedPreset } from "@react-email/tailwind";
import * as React from "react";
import { getSiteUrl } from "@/lib/email/resend";
import type { EmailLocale } from "@/lib/email/templates/translations";
import { getEmailStrings } from "@/lib/email/templates/translations";

export type EmailLayoutProps = {
  children: React.ReactNode;
  preview: string;
  locale: EmailLocale;
};

const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #0f172a !important; }
    .email-shell { background-color: #1e293b !important; }
    .email-text { color: #f1f5f9 !important; }
    .email-muted { color: #94a3b8 !important; }
    .email-footer { background-color: #0f172a !important; }
    .email-card { background-color: #334155 !important; }
    .email-border { border-color: #475569 !important; }
  }
`;

export function EmailLayout({ children, preview, locale }: EmailLayoutProps) {
  const s = getEmailStrings(locale);
  const siteUrl = getSiteUrl();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const settingsPath = `${siteUrl}/${locale}/settings/notifications`;

  return (
    <Html dir={dir} lang={locale}>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style dangerouslySetInnerHTML={{ __html: darkModeCss }} />
      </Head>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                glatko: {
                  primary: "#6366F1",
                  accent: "#14B8A6",
                  dark: "#1E293B",
                },
              },
            },
          },
        }}
      >
        <Body className="email-body mx-auto bg-slate-50 font-sans">
          <Preview>{preview}</Preview>
          <Container className="email-shell mx-auto my-[24px] max-w-[560px] rounded-lg bg-white px-[24px] py-[32px]">
            <Section className="email-border mb-[24px] border-b border-solid border-glatko-primary pb-[16px]">
              <Text className="email-text m-0 text-[26px] font-bold leading-[32px] text-glatko-primary">
                {s.companyName}
              </Text>
              <Text className="email-muted m-0 mt-[6px] text-[13px] leading-[20px] text-slate-500">
                {s.tagline}
              </Text>
            </Section>
            {children}
            <Hr className="email-border my-[28px] border-slate-200" />
            <Section className="email-footer rounded-lg bg-slate-100 px-[16px] py-[20px]">
              <Text className="email-muted m-0 text-center text-[12px] leading-[18px] text-slate-500">
                {s.footerCopyright}
              </Text>
              <Text className="m-0 mt-[12px] text-center">
                <Link
                  href={settingsPath}
                  className="text-[12px] font-medium text-glatko-primary no-underline"
                >
                  {s.unsubscribeLabel}
                </Link>
              </Text>
              <Text className="m-0 mt-[8px] text-center">
                <Link
                  href={siteUrl}
                  className="text-[12px] font-medium text-glatko-accent no-underline"
                >
                  {s.viewOnPlatform}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

/** Optional section heading inside templates */
export function EmailSectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Heading
      as="h2"
      className="email-text m-0 mb-[16px] text-[20px] font-semibold leading-[28px] text-glatko-dark"
    >
      {children}
    </Heading>
  );
}

export function EmailInfoCard({ children }: { children: React.ReactNode }) {
  return (
    <Section className="email-card mb-[20px] rounded-lg bg-slate-100 px-[16px] py-[14px]">
      {children}
    </Section>
  );
}

export function EmailPrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="my-[24px] text-center">
      <Link
        href={href}
        className="inline-block rounded-lg bg-glatko-primary px-[22px] py-[12px] text-[14px] font-semibold text-white no-underline"
      >
        {children}
      </Link>
    </Section>
  );
}
