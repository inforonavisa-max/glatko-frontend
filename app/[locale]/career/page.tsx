import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Briefcase } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { VerticalBrand } from "@/components/glatko/verticals/VerticalBrand";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t("careerVertical.seoTitle"),
    // Placeholder page — noindex until the vertical actually exists
    // (same quarantine rationale as the health routes).
    robots: { index: false, follow: false },
  };
}

/**
 * K1: standalone coming-soon placeholder for the future labor-supply
 * vertical. No waitlist yet — the 3-tab navigation needs a real
 * destination; content arrives with its own sprint series.
 */
export default async function CareerComingSoonPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="bg-brandCareer-50/60 dark:bg-transparent">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brandCareer-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brandCareer-700 dark:bg-brandCareer/15 dark:text-brandCareer">
          <Briefcase className="h-3.5 w-3.5" />
          {t("verticals.soon")}
        </span>
        {/* Named sub-brand lockup (§1.6) is the coming-soon hero */}
        <h1 className="mt-6">
          <VerticalBrand vertical="career" size="lg" />
        </h1>
        <p className="mx-auto mt-3 text-lg text-gray-700 dark:text-white/80">
          {t("careerVertical.title")}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-white/60">
          {t("careerVertical.subtitle")}
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
          >
            {t("careerVertical.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
