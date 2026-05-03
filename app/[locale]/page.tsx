import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { routing, type Locale } from "@/i18n/routing";
import LandingPageClient, {
  type FeaturedCategoryCard,
} from "./landing-page-client";
import { generateWebSiteSchema, jsonLdScriptProps } from "@/lib/seo/jsonld";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

const FEATURED_CATEGORY_SLUGS = [
  "boat-services",
  "home-cleaning",
  "renovation-construction",
  "beauty-wellness",
] as const;

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();

  const supabase = createClient();

  const { data: rows } = await supabase
    .from("glatko_service_categories")
    .select("id, slug, name, description, hero_image_url, icon")
    .in("slug", FEATURED_CATEGORY_SLUGS as unknown as string[])
    .is("parent_id", null)
    .eq("is_active", true);

  const bySlug = new Map(
    (rows ?? []).map((r) => [r.slug as string, r as FeaturedCategoryCard]),
  );
  const featuredCategories: FeaturedCategoryCard[] = FEATURED_CATEGORY_SLUGS
    .map((s) => bySlug.get(s))
    .filter((c): c is FeaturedCategoryCard => Boolean(c));

  const { count: totalCategoryCount } = await supabase
    .from("glatko_service_categories")
    .select("id", { count: "exact", head: true })
    .is("parent_id", null)
    .eq("is_active", true);

  return (
    <>
      <script {...jsonLdScriptProps(generateWebSiteSchema(locale))} />
      <LandingPageClient
        featuredCategories={featuredCategories}
        totalCategoryCount={totalCategoryCount ?? 0}
        locale={locale as Locale}
      />
    </>
  );
}
