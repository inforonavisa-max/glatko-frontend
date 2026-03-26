import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LandingPageClient from "./landing-page-client";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  return <LandingPageClient />;
}
