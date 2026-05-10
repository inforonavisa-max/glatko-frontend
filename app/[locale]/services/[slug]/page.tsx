import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Users, Star } from "lucide-react";
import type { Metadata } from "next";

import { PageBackground } from "@/components/ui/PageBackground";
import { Breadcrumb, type BreadcrumbCrumb } from "@/components/seo/Breadcrumb";
import {
  getCategoryBySlug,
  getCategoryWithStats,
  getCitiesServingCategory,
  getSubCategories,
  searchProfessionals,
} from "@/lib/supabase/glatko.server";
import { SEO_BASE, SEO_LOCALES, hreflangForLocale } from "@/lib/seo";
import {
  generateBreadcrumbSchema,
  generateCategoryLocalBusinessSchema,
  generateFAQPageSchema,
  generateItemListSchema,
  generateServiceSchema,
  jsonLdScriptProps,
  type BreadcrumbItem as JsonLdBreadcrumbItem,
  type LocalizedFAQ,
} from "@/lib/seo/jsonld";
import type { Locale } from "@/i18n/routing";
import type { MultiLangText } from "@/types/glatko";

type Props = {
  params:
    | Promise<{ locale: string; slug: string }>
    | { locale: string; slug: string };
};

export const revalidate = 3600;

function pickLocalized(
  obj: Record<string, string> | null | undefined,
  locale: string,
  fallback: string,
): string {
  if (!obj) return fallback;
  return obj[locale] || obj.en || fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const category = await getCategoryBySlug(slug);
  if (!category) return { robots: { index: false } };

  const t = await getTranslations({ locale });
  const name = pickLocalized(category.name, locale, slug);
  const description =
    pickLocalized(category.description, locale, "") ||
    t("services.metaDescription", { name });

  // 9-locale hreflang (memory item 25 — every page; layout-level
  // <HreflangLinks> is a defensive duplicate that crawlers tolerate).
  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) {
    languages[hreflangForLocale(l)] = `${SEO_BASE}/${l}/services/${slug}`;
  }
  languages["x-default"] = `${SEO_BASE}/en/services/${slug}`;

  return {
    title: `${name} — Glatko`,
    description,
    alternates: {
      canonical: `${SEO_BASE}/${locale}/services/${slug}`,
      languages,
    },
    openGraph: {
      title: `${name} — Glatko`,
      description,
      url: `${SEO_BASE}/${locale}/services/${slug}`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Glatko`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, localeParam)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations();

  const category = await getCategoryBySlug(slug);
  if (!category) {
    // Hot-fix safety net (PR #25): some legacy slugs (e.g. home-services)
    // were deactivated when their parent split into smaller categories.
    // Send the user to the all-categories index instead of a hard 404 so
    // stale outbound links from email / social / older pages still land
    // somewhere useful. Keep notFound() for genuinely unknown slugs.
    const RETIRED_SLUG_REDIRECTS: Record<string, string> = {
      "home-services": "home-cleaning",
    };
    const replacement = RETIRED_SLUG_REDIRECTS[slug];
    if (replacement) {
      redirect(`/${locale}/services/${replacement}`);
    }
    notFound();
  }

  // Parallel: sub-categories, pro count, cities for areaServed, top pros.
  const [subCategories, stats, citiesFromPros, { professionals }] =
    await Promise.all([
      getSubCategories(category.id),
      getCategoryWithStats(slug),
      getCitiesServingCategory(category.id),
      searchProfessionals({
        locale,
        categorySlug: slug,
        sortBy: "rating",
        limit: 6,
      }),
    ]);
  const proCount = stats?.proCount ?? 0;

  const categoryName = pickLocalized(category.name, locale, slug);
  const categoryDesc = pickLocalized(category.description, locale, "");

  // ── JSON-LD schemas ────────────────────────────────────────────────────
  const serviceSchema = generateServiceSchema(category, locale, citiesFromPros);
  const localBusinessSchema = generateCategoryLocalBusinessSchema(
    category,
    locale,
    citiesFromPros,
  );
  const itemListSchema =
    subCategories.length > 0
      ? generateItemListSchema(
          subCategories.map((s) => ({
            slug: s.slug as string,
            name: s.name as Record<string, string>,
          })),
          locale,
          "/services",
        )
      : null;

  // ── Breadcrumbs (DOM + JSON-LD share the crumb list) ───────────────────
  const homeLabel = "Glatko";
  const servicesLabel = t("nav.services");
  const breadcrumbCrumbs: BreadcrumbCrumb[] = [
    { name: homeLabel, href: "/" },
    { name: servicesLabel, href: "/services" },
  ];
  if (category.parent_slug) {
    const parentName = pickLocalized(
      category.parent_name,
      locale,
      category.parent_slug,
    );
    breadcrumbCrumbs.push({
      name: parentName,
      href: `/services/${category.parent_slug}`,
    });
  }
  breadcrumbCrumbs.push({
    name: categoryName,
    href: `/services/${slug}`,
  });

  const breadcrumbSchemaItems: JsonLdBreadcrumbItem[] = [
    { name: homeLabel, url: `${SEO_BASE}/${locale}` },
    { name: servicesLabel, url: `${SEO_BASE}/${locale}/services` },
  ];
  if (category.parent_slug) {
    breadcrumbSchemaItems.push({
      name: pickLocalized(
        category.parent_name,
        locale,
        category.parent_slug,
      ),
      url: `${SEO_BASE}/${locale}/services/${category.parent_slug}`,
    });
  }
  breadcrumbSchemaItems.push({
    name: categoryName,
    url: `${SEO_BASE}/${locale}/services/${slug}`,
  });
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbSchemaItems);

  // FAQ schema + visible content. Falls back gracefully when a category has
  // no seeded FAQs yet (only 4 P0 categories seeded as of migration 042).
  const categoryFaqs = (category.faqs ?? []) as LocalizedFAQ[];
  const faqSchema = generateFAQPageSchema(categoryFaqs, locale);
  const faqLocalized = categoryFaqs
    .map((entry) => {
      const q = entry.q?.[locale] || entry.q?.en;
      const a = entry.a?.[locale] || entry.a?.en;
      if (!q || !a) return null;
      return { q, a };
    })
    .filter((x): x is { q: string; a: string } => x !== null);

  return (
    <PageBackground opacity={0.1}>
      <script {...jsonLdScriptProps(serviceSchema)} />
      <script {...jsonLdScriptProps(localBusinessSchema)} />
      {itemListSchema ? (
        <script {...jsonLdScriptProps(itemListSchema)} />
      ) : null}
      <script {...jsonLdScriptProps(breadcrumbSchema)} />
      {faqSchema ? <script {...jsonLdScriptProps(faqSchema)} /> : null}

      <Breadcrumb items={breadcrumbCrumbs} />

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
            {proCount} {t("services.prosInCategory")}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Sub-categories */}
        {subCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
              {t("services.subcategories")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {subCategories.map(
                (child: {
                  id: string;
                  slug: string;
                  name: unknown;
                }) => {
                  const childName =
                    (child.name as MultiLangText)?.[locale] ||
                    (child.name as MultiLangText)?.en ||
                    child.slug;
                  return (
                    <Link
                      key={child.id}
                      href={{ pathname: "/services/[slug]", params: { slug: child.slug } }}
                      className="rounded-full border border-gray-200/50 bg-white/70 px-5 py-2.5 text-sm text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-teal-500/20 dark:hover:text-teal-400"
                    >
                      {childName}
                    </Link>
                  );
                },
              )}
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
                const displayName =
                  p.business_name || p.profile?.full_name || "Professional";
                const initials = displayName.trim().split(/\s+/).filter(Boolean);
                const ini =
                  initials.length >= 2
                    ? (initials[0][0] + initials[1][0]).toUpperCase()
                    : (initials[0] || "?").slice(0, 2).toUpperCase();
                const fullStars = Math.min(5, Math.round(p.avg_rating));
                return (
                  <Link
                    key={p.id}
                    href={{ pathname: "/provider/[id]", params: { id: p.id } }}
                    className="group rounded-2xl border border-gray-200/50 bg-white/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/20 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-sm font-semibold text-teal-600 dark:text-teal-400">
                        {ini}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {displayName}
                        </p>
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

        {/* FAQ — visible answers required for FAQPage rich-result eligibility */}
        {faqLocalized.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-serif text-xl font-semibold text-gray-900 dark:text-white">
              {t("services.faq")}
            </h2>
            <div className="space-y-3">
              {faqLocalized.map((entry, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-gray-200/50 bg-white/70 px-5 py-4 backdrop-blur-sm transition-all duration-200 open:border-teal-500/30 open:bg-teal-500/[0.04] dark:border-white/[0.08] dark:bg-white/[0.03] dark:open:border-teal-500/20"
                >
                  <summary className="cursor-pointer list-none text-sm font-medium text-gray-900 marker:hidden dark:text-white">
                    <span className="flex items-center justify-between gap-4">
                      <span>{entry.q}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-teal-600 transition-transform duration-200 group-open:rotate-90 dark:text-teal-400" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-white/60">
                    {entry.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/services?openSearch=1"
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
  );
}
