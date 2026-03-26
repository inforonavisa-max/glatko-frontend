import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Users, Star } from "lucide-react";
import { PageBackground } from "@/components/ui/PageBackground";
import { getCategoryWithStats, searchProfessionals } from "@/lib/supabase/glatko.server";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import { HreflangLinks } from "@/components/seo/HreflangLinks";
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
  };
}

export const revalidate = 3600;

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
    <>
      <HreflangLinks locale={locale} path={`/services/${slug}`} />
      <PageBackground opacity={0.1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: categoryName,
            description: categoryDesc || `${categoryName} professionals in Montenegro`,
            provider: { "@type": "Organization", name: "Glatko", url: "https://glatko.app" },
            areaServed: { "@type": "Country", name: "Montenegro" },
          }),
        }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-teal-600/[0.12] via-teal-500/[0.05] to-transparent py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {categoryName}
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
          {categoryDesc && (
            <p className="mt-4 max-w-2xl text-sm text-gray-600 dark:text-white/50">
              {categoryDesc}
            </p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm text-teal-700 dark:text-teal-300">
            <Users className="h-4 w-4" />
            {category.proCount} {t("services.prosInCategory")}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Sub-categories */}
        {category.children.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
              {t("services.subcategories")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {category.children.map((child: { id: string; slug: string; name: unknown }) => {
                const childName = (child.name as MultiLangText)?.[locale] ||
                  (child.name as MultiLangText)?.en || child.slug;
                return (
                  <Link
                    key={child.id}
                    href={`/providers?category=${child.slug}`}
                    className="rounded-full border border-gray-200/50 bg-white/70 px-5 py-2.5 text-sm text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                  >
                    {childName}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Pro list */}
        {professionals.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-serif text-xl font-semibold text-gray-900 dark:text-white">
              {t("services.topPros")}
            </h2>
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
                const fullStars = Math.min(5, Math.round(p.avg_rating));
                return (
                  <Link
                    key={p.id}
                    href={`/provider/${p.id}`}
                    className="group rounded-2xl border border-gray-200/50 bg-white/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/20 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-semibold text-teal-600 dark:text-teal-400">
                        {ini}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">{displayName}</p>
                        <div className="mt-0.5 flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < fullStars ? "fill-teal-500 text-teal-500" : "text-gray-300 dark:text-white/20"}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-500 dark:text-white/40">
                            {p.avg_rating.toFixed(1)} ({p.total_reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-teal-400">
                      {t("search.card.viewProfile")} &rarr;
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`/providers?category=${slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 px-6 py-3 text-sm font-medium text-teal-700 transition-all hover:border-teal-500/50 hover:bg-teal-500/5 dark:text-teal-300"
          >
            {t("services.viewAllPros")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/request-service"
            className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30"
          >
            {t("services.requestInCategory")}
          </Link>
        </div>
      </div>
    </PageBackground>
    </>
  );
}
