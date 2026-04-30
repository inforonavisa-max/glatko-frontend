import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { routing, type Locale } from "@/i18n/routing";
import { CategoryGrid, type P0CategoryCard } from "@/components/categories/CategoryGrid";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale });
  const title = t("seo.servicesTitle");
  const description = t("seo.servicesDesc");
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/services` },
    openGraph: {
      title,
      description,
      url: `https://glatko.app/${locale}/services`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Glatko",
  url: "https://glatko.app",
  description:
    "Montenegro's digital marketplace to post service requests, receive bids from verified professionals, and choose the best fit.",
  areaServed: { "@type": "Country", name: "Montenegro" },
} as const;

type RootRow = {
  id: string;
  slug: string;
  name: Record<string, string>;
  icon: string | null;
  hero_image_url: string | null;
  seasonal: string | null;
  active_months: number[] | null;
  badge_priority: number | null;
};

type SubRow = {
  id: string;
  parent_id: string;
  slug: string;
  name: Record<string, string>;
  sort_order: number | null;
};

type ProServiceRow = {
  professional_id: string;
  category_id: string;
};

function pickName(name: Record<string, string>, locale: Locale): string {
  return name[locale] ?? name.en ?? Object.values(name)[0] ?? "";
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const supabase = createClient();
  const t = await getTranslations();

  const { data: roots } = await supabase
    .from("glatko_service_categories")
    .select(
      "id, slug, name, icon, hero_image_url, seasonal, active_months, badge_priority",
    )
    .eq("is_p0", true)
    .is("parent_id", null)
    .eq("is_active", true)
    .order("badge_priority", { ascending: true });

  const rootRows = (roots ?? []) as RootRow[];
  const rootIds = rootRows.map((r) => r.id);

  const { data: subs } = rootIds.length
    ? await supabase
        .from("glatko_service_categories")
        .select("id, parent_id, slug, name, sort_order")
        .in("parent_id", rootIds)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    : { data: [] as SubRow[] };

  const subRows = (subs ?? []) as SubRow[];

  const { data: proServices } = rootIds.length
    ? await supabase
        .from("glatko_pro_services")
        .select("professional_id, category_id")
        .in(
          "category_id",
          [...rootIds, ...subRows.map((s) => s.id)],
        )
    : { data: [] as ProServiceRow[] };

  const proRows = (proServices ?? []) as ProServiceRow[];

  // Aggregate distinct pros per root (subs roll up to their parent root).
  const subToRoot = new Map<string, string>();
  for (const sub of subRows) subToRoot.set(sub.id, sub.parent_id);
  const proSetByRoot = new Map<string, Set<string>>();
  for (const ps of proRows) {
    const rootId = subToRoot.get(ps.category_id) ?? ps.category_id;
    if (!rootIds.includes(rootId)) continue;
    let bag = proSetByRoot.get(rootId);
    if (!bag) {
      bag = new Set();
      proSetByRoot.set(rootId, bag);
    }
    bag.add(ps.professional_id);
  }

  // First 3 subs per root (already ordered by sort_order ASC).
  const subsByRoot = new Map<string, SubRow[]>();
  for (const sub of subRows) {
    const arr = subsByRoot.get(sub.parent_id) ?? [];
    if (arr.length < 3) arr.push(sub);
    subsByRoot.set(sub.parent_id, arr);
  }

  const cards: P0CategoryCard[] = rootRows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: pickName(r.name, locale as Locale),
    src: r.hero_image_url ?? "",
    icon: r.icon ?? "Tag",
    seasonal: r.seasonal,
    active_months: r.active_months,
    pro_count: proSetByRoot.get(r.id)?.size ?? 0,
    subs: (subsByRoot.get(r.id) ?? []).map((s) => ({
      slug: s.slug,
      label: pickName(s.name, locale as Locale),
    })),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ORGANIZATION_JSON_LD),
        }}
      />
      <main className="min-h-screen bg-[#F8F6F0] dark:bg-[#0b1f23]">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <header className="mx-auto max-w-3xl text-center mb-10 md:mb-14">
            <h1 className="font-serif text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {t("categories.allHeading")}
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-white/60">
              {t("categories.allSubheading")}
            </p>
          </header>
          {cards.length > 0 ? (
            <CategoryGrid cards={cards} />
          ) : (
            <div className="text-center py-20 text-gray-500 dark:text-white/50">
              {t("categories.allSubheading")}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
