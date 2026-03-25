import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Home, Anchor, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageBackground } from "@/components/ui/PageBackground";
import type { Metadata } from "next";
import { getAlternates } from "@/lib/seo";

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
    alternates: getAlternates(locale, "/services"),
    robots: { index: true, follow: true },
  };
}

export const revalidate = 3600;

export default async function ServicesPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();

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
  ];

  const boatSubcategories = [
    { key: "captainHire", slug: "captain-hire" },
    { key: "antifouling", slug: "antifouling" },
    { key: "engineService", slug: "engine-service" },
    { key: "hullCleaning", slug: "hull-cleaning" },
    { key: "winterization", slug: "winterization" },
    { key: "charterPrep", slug: "charter-prep" },
    { key: "emergencyRepair", slug: "emergency-repair" },
    { key: "haulOut", slug: "haul-out" },
  ];

  return (
    <PageBackground opacity={0.1}>
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t("services.title")}
          </h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
          <p className="mt-4 text-sm text-gray-500 dark:text-white/50">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Home Services */}
          <div className="group rounded-3xl border border-gray-200/50 bg-white/70 p-8 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] md:p-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <Home className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("categories.home.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              {t("categories.home.description")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {homeSubcategories.map((s) => (
                <Link
                  key={s.slug}
                  href={`/providers?category=${s.slug}`}
                  className="rounded-full border border-gray-200 bg-gray-100/80 px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                >
                  {t(`categories.home.${s.key}`)}
                </Link>
              ))}
            </div>
            <Link
              href="/providers?category=home-services"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1 dark:text-teal-400"
            >
              {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Boat Services */}
          <div className="group rounded-3xl border border-gray-200/50 bg-white/70 p-8 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/30 hover:shadow-xl dark:border-white/[0.08] dark:bg-white/[0.03] md:p-10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10">
              <Anchor className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("categories.boat.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              {t("categories.boat.description")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {boatSubcategories.map((s) => (
                <Link
                  key={s.slug}
                  href={`/providers?category=${s.slug}`}
                  className="rounded-full border border-gray-200 bg-gray-100/80 px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                >
                  {t(`categories.boat.${s.key}`)}
                </Link>
              ))}
            </div>
            <Link
              href="/providers?category=boat-services"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1 dark:text-teal-400"
            >
              {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-gray-200/50 bg-white/70 p-8 text-center backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]">
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
