import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { listSpecialties } from "@/lib/saglik/queries";
import { buildAlternates } from "@/lib/seo";
import { getCityBySlug } from "@/lib/glatko/cities";
import { parseHealthFilters, type SearchParamsLike } from "@/lib/saglik/filters";
import { SpecialtyDirectory } from "@/components/glatko-saglik/SpecialtyDirectory";

/**
 * H3 specialty × city SEO page — the canonical form of the city filter (clean
 * path segment, not ?city=). Mirrors the /services/[slug]/[city] STRUCTURE
 * (validate → notFound on miss; self-canonical via buildAlternates) but stays
 * noindex (SEO quarantine) until launch and reads the filtered directory.
 *
 * QUARANTINE is automatic on three independent mechanisms (all cover health by
 * construction): (1) middleware deletes the hreflang Link header for /saglik|
 * /health/*; (2) app/sitemap.ts never enumerates health routes; (3) robots
 * noindex,follow set below. buildAlternates still emits a SELF-canonical (single
 * source — feedback_seo-canonical-single-source) so when the flag flips at
 * launch the SEO is already correctly single-sourced; the alternates exist but
 * middleware suppresses the header pre-launch. Gated layout 404s when off.
 *
 * ISR (revalidate=3600), no generateStaticParams (DYNAMIC_SERVER_USAGE), admin
 * client (cookie-free) via lib/saglik/queries.
 */
type Props = {
  params:
    | Promise<{ locale: string; specialty: string; city: string }>
    | { locale: string; specialty: string; city: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, specialty, city: citySlug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};

  const city = getCityBySlug(citySlug);
  if (!city) return { robots: { index: false, follow: false } };

  const specialties = await listSpecialties(locale as Locale);
  const match = specialties.find((s) => s.slug === specialty);
  if (!match) return { robots: { index: false, follow: false } };

  // Self-canonical + 9 hreflang via the single SEO source. SINGLE emission only.
  const alternates = buildAlternates(locale, "/health/[specialty]/[city]", {
    specialty,
    city: citySlug,
  });

  return {
    title: `${match.name} · ${city.name}`,
    alternates,
    // Quarantine: noindex until H11 launch (matches existing health pages).
    robots: { index: false, follow: false },
  };
}

export default async function SpecialtyCityPage({ params, searchParams }: Props) {
  const { locale, specialty, city: citySlug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;

  // Validate city (GLATKO_CITIES) + specialty (read-RPC); unknown → 404 (mirror
  // services [slug]/[city]). K3 coastal clustering does NOT mint bogus pages —
  // only real GLATKO_CITIES slugs resolve here.
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const specialties = await listSpecialties(l);
  const specialtyInfo = specialties.find((s) => s.slug === specialty);
  if (!specialtyInfo) notFound();

  // The city is the PATH segment → force it into the parsed filters (overrides
  // any stale ?city= in the query). Remaining filters come from searchParams.
  const sp = ((await Promise.resolve(searchParams)) ?? {}) as SearchParamsLike;
  const filters = { ...parseHealthFilters(sp), city: citySlug };

  return (
    <SpecialtyDirectory
      specialtySlug={specialty}
      specialtyName={specialtyInfo.name}
      locale={l}
      filters={filters}
    />
  );
}
