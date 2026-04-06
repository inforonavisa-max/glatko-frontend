import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LandingPageClient from "./landing-page-client";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Glatko",
  url: "https://glatko.app",
  description:
    "Montenegro's digital marketplace to post service requests, receive bids from verified professionals, and choose the best fit.",
  areaServed: { "@type": "Country", name: "Montenegro" },
} as const;

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ORGANIZATION_JSON_LD),
        }}
      />
      <LandingPageClient />
    </>
  );
}
