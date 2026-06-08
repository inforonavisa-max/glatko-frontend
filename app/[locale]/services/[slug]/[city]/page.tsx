import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { PageBackground } from "@/components/ui/PageBackground";
import { Breadcrumb, type BreadcrumbCrumb } from "@/components/seo/Breadcrumb";
import { getCategoryBySlug } from "@/lib/supabase/glatko.server";
import { buildAlternates } from "@/lib/seo";
import { GLATKO_CITIES } from "@/lib/glatko/cities";

/**
 * Service × city page — G-PSEO-FOUNDATION, Phase 1/5 (routing + scaffold).
 *
 * This phase ships routing, metadata, hreflang/canonical and an i18n-complete
 * "coming soon" placeholder ONLY. Every valid {category × city} combination is
 * reachable but `noindex` until:
 *   • Phase 2 — liquidity gate (≥3 providers AND ≥5 historical bids) decides
 *     which combinations may be indexed, and
 *   • Phase 3 — content generation fills real, non-fabricated copy.
 *
 * SEO is single-sourced through buildAlternates() (self-canonical per locale +
 * 9-locale hreflang), exactly like /services/[slug]. No /me-master override
 * here: that strategy is provider-specific; services pages are self-canonical.
 */
type Props = {
  params:
    | Promise<{ locale: string; slug: string; city: string }>
    | { locale: string; slug: string; city: string };
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

function findCity(citySlug: string) {
  return GLATKO_CITIES.find((c) => c.slug === citySlug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, city: citySlug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};

  const category = await getCategoryBySlug(slug);
  const city = findCity(citySlug);
  if (!category || !city) return { robots: { index: false, follow: false } };

  const t = await getTranslations({ locale });
  const service = pickLocalized(category.name, locale, slug);
  const vars = { service, city: city.name };
  const title = t("servicesCity.titlePattern", vars);
  const description = t("servicesCity.metaDescription", vars);
  const alternates = buildAlternates(locale, "/services/[slug]/[city]", {
    slug,
    city: citySlug,
  });

  return {
    title,
    description,
    alternates,
    // Scaffold phase: keep out of the index until Phase 2 liquidity-gates and
    // Phase 3 adds real content. `follow` so crawlers still reach the linked
    // category page.
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServiceCityPage({ params }: Props) {
  const {
    locale: localeParam,
    slug,
    city: citySlug,
  } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, localeParam)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const category = await getCategoryBySlug(slug);
  const city = findCity(citySlug);
  if (!category || !city) notFound();

  const t = await getTranslations();
  const service = pickLocalized(category.name, locale, slug);
  const vars = { service, city: city.name };

  const crumbs: BreadcrumbCrumb[] = [
    { name: "Glatko", href: "/" },
    { name: t("nav.services"), href: "/services" },
    { name: service, href: { pathname: "/services/[slug]", params: { slug } } },
    {
      name: city.name,
      href: {
        pathname: "/services/[slug]/[city]",
        params: { slug, city: citySlug },
      },
    },
  ];

  return (
    <PageBackground opacity={0.1}>
      <Breadcrumb items={crumbs} />

      <div className="bg-gradient-to-b from-teal-600/[0.12] via-teal-500/[0.05] to-transparent py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t("servicesCity.titlePattern", vars)}
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-8 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <h2 className="font-serif text-xl font-semibold text-gray-900 dark:text-white">
            {t("servicesCity.comingSoonTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-white/60">
            {t("servicesCity.comingSoonBody")}
          </p>
          <Link
            href={{ pathname: "/services/[slug]", params: { slug } }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/5 px-5 py-2.5 text-sm font-medium text-teal-700 transition hover:bg-teal-500/10 dark:text-teal-300"
          >
            {t("servicesCity.browseCategory", vars)}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PageBackground>
  );
}
