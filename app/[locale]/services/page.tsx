import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Home, Anchor, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import { SpotlightCard } from "@/components/landing/spotlight-card";
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
  };
}

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
    <div className="relative min-h-screen bg-[#F8F6F0] dark:bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0.12 }} aria-hidden>
        <BackgroundGrids />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl text-gray-900 dark:text-white sm:text-4xl">
            {t("services.title")}
          </h1>
          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
          <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <SpotlightCard>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                <Home className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-left">
                <h2 className="font-sans text-xl font-semibold text-gray-900 dark:text-white">
                  {t("categories.home.title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {t("categories.home.description")}
                </p>
              </div>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {homeSubcategories.map((s) => (
                <Link
                  key={s.slug}
                  href={`/providers?category=${s.slug}`}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-teal-500/30 hover:bg-teal-50 hover:text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                >
                  {t(`categories.home.${s.key}`)}
                </Link>
              ))}
            </div>
            <Link
              href="/providers?category=home-services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400"
            >
              {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
            </Link>
          </SpotlightCard>

          <SpotlightCard>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                <Anchor className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-left">
                <h2 className="font-sans text-xl font-semibold text-gray-900 dark:text-white">
                  {t("categories.boat.title")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {t("categories.boat.description")}
                </p>
              </div>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {boatSubcategories.map((s) => (
                <Link
                  key={s.slug}
                  href={`/providers?category=${s.slug}`}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-teal-500/30 hover:bg-teal-50 hover:text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                >
                  {t(`categories.boat.${s.key}`)}
                </Link>
              ))}
            </div>
            <Link
              href="/providers?category=boat-services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400"
            >
              {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
            </Link>
          </SpotlightCard>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/request-service"
            className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
          >
            {t("services.requestInCategory")}
          </Link>
        </div>
      </div>
    </div>
  );
}
