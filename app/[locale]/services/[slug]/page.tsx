import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Users } from "lucide-react";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { getCategoryWithStats, searchProfessionals } from "@/lib/supabase/glatko.server";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import type { MultiLangText } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const category = await getCategoryWithStats(slug);
  if (!category) return {};
  const nameObj = category.name as MultiLangText;
  const name = nameObj?.[locale as Locale] || nameObj?.en || slug;
  return {
    title: `${name} — Glatko`,
    description: `${name} professionals in Montenegro. Get verified quotes on Glatko.`,
    openGraph: {
      title: `${name} — Glatko`,
      description: `${name} professionals in Montenegro. Get verified quotes on Glatko.`,
      url: `https://glatko.app/${locale}/services/${slug}`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    alternates: {
      languages: Object.fromEntries(
        ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"].map((l) => [
          l,
          `/${l}/services/${slug}`,
        ])
      ),
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, localeParam)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations();

  const category = await getCategoryWithStats(slug);
  if (!category) notFound();

  const nameObj = category.name as MultiLangText;
  const categoryName = nameObj?.[locale] || nameObj?.en || slug;
  const descObj = category.description as MultiLangText | null;
  const categoryDesc = descObj?.[locale] || descObj?.en || "";

  const { professionals } = await searchProfessionals({
    locale,
    categorySlug: slug,
    sortBy: "rating",
    limit: 6,
  });

  return (
    <div className="relative min-h-screen bg-[#F8F6F0] dark:bg-[#080808]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0.12 }} aria-hidden>
        <BackgroundGrids />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-gray-900 dark:text-white sm:text-4xl">
            {categoryName}
          </h1>
          <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
          {categoryDesc && (
            <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
              {categoryDesc}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-500" />
            <span className="text-sm text-gray-600 dark:text-white/50">
              {category.proCount} {t("services.prosInCategory")}
            </span>
          </div>
        </div>

        {category.children.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
              {t("services.subcategories")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child: { id: string; slug: string; name: unknown }) => {
                const childName = (child.name as MultiLangText)?.[locale] ||
                  (child.name as MultiLangText)?.en || child.slug;
                return (
                  <Link
                    key={child.id}
                    href={`/providers?category=${child.slug}`}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-teal-500/30 hover:bg-teal-50 hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                  >
                    {childName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {professionals.length > 0 && (
          <div className="mb-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => {
                const p = pro as {
                  id: string;
                  business_name: string | null;
                  avg_rating: number;
                  total_reviews: number;
                  completed_jobs: number;
                  location_city: string | null;
                  is_verified: boolean;
                  profile?: { full_name: string | null; avatar_url: string | null } | null;
                };
                const displayName = p.business_name || p.profile?.full_name || "Professional";
                const initials = displayName.trim().split(/\s+/).filter(Boolean);
                const ini = initials.length >= 2
                  ? (initials[0][0] + initials[1][0]).toUpperCase()
                  : (initials[0] || "?").slice(0, 2).toUpperCase();
                return (
                  <SpotlightCard key={p.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                        {ini}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900 dark:text-white">{displayName}</p>
                        <p className="text-xs text-gray-500 dark:text-white/40">
                          ★ {p.avg_rating.toFixed(1)} · {p.total_reviews} {t("bidComparison.rating")}
                          {p.location_city && ` · ${p.location_city}`}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/provider/${p.id}`}
                      className="mt-3 block text-center text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      {t("search.card.viewProfile")}
                    </Link>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`/providers?category=${slug}`}
            className="inline-flex items-center gap-1 rounded-xl border border-teal-500/30 px-6 py-3 text-sm font-medium text-teal-700 transition-all hover:border-teal-500/50 hover:bg-teal-500/5 dark:text-teal-300"
          >
            {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/request-service"
            className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/20"
          >
            {t("services.requestInCategory")}
          </Link>
        </div>
      </div>
    </div>
  );
}
