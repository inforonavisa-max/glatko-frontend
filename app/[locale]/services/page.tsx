import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageBackground } from "@/components/ui/PageBackground";
import { TabbedServiceHero } from "@/components/glatko/services/TabbedServiceHero";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t("seo.servicesTitle"),
    description: t("seo.servicesDesc"),
    openGraph: {
      title: t("seo.servicesTitle"),
      description: t("seo.servicesDesc"),
      url: `https://glatko.app/${locale}/services`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

const homeSubcategories = [
  { key: "generalCleaning", slug: "general-cleaning" },
  { key: "deepCleaning", slug: "deep-cleaning" },
  { key: "villaAirbnb", slug: "villa-airbnb" },
  { key: "renovation", slug: "renovation" },
  { key: "painting", slug: "painting" },
  { key: "electrical", slug: "electrical" },
  { key: "plumbing", slug: "plumbing" },
  { key: "acHeating", slug: "ac-heating" },
  { key: "furnitureAssembly", slug: "furniture-assembly" },
  { key: "garden", slug: "garden" },
  { key: "pool", slug: "pool" },
] as const;

const boatSubcategories = [
  { key: "captainHire", slug: "captain-hire" },
  { key: "antifouling", slug: "antifouling" },
  { key: "engineService", slug: "engine-service" },
  { key: "hullCleaning", slug: "hull-cleaning" },
  { key: "winterization", slug: "winterization" },
  { key: "charterPrep", slug: "charter-prep" },
  { key: "emergencyRepair", slug: "emergency-repair" },
  { key: "haulOut", slug: "haul-out" },
] as const;

export default async function ServicesPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <PageBackground opacity={0.1}>
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <TabbedServiceHero
          homeItems={[...homeSubcategories]}
          boatItems={[...boatSubcategories]}
        />

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-gray-200/50 bg-white/70 p-8 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <p className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
            {t("services.requestInCategory")}
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/request-service"
              className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30"
            >
              {t("services.requestInCategory")}
            </Link>
            <Link
              href="/become-a-pro"
              className="inline-block rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:border-teal-500/30 hover:text-teal-600 dark:border-white/[0.1] dark:text-white/60 dark:hover:text-teal-400"
            >
              {t("pro.wizard.title")}
            </Link>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
