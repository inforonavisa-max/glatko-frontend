import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Globe,
  Languages,
  MapPin,
  Star,
} from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { routing } from "@/i18n/routing";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getProfessionalProfile, getPublishedReviews, calculateTrustBadges } from "@/lib/supabase/glatko.server";
import { TrustBadge } from "@/components/glatko/trust/TrustBadge";
import { ReviewSection } from "@/components/glatko/review/ReviewSection";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import type { MultiLangText, ProService, ProfessionalProfile } from "@/types/glatko";

type ReviewItem = {
  id: string;
  overall_rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  review_text: string | null;
  photos: string[];
  created_at: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
  service_request: { title: string; category: { name: Record<string, string>; icon: string } | null } | null;
};

function labelForCategory(
  category: ProService["category"] | undefined,
  locale: Locale
): string {
  const raw = category?.name;
  if (!raw || typeof raw !== "object") return "";
  const n = raw as MultiLangText;
  return (
    n[locale] ??
    n.en ??
    n.tr ??
    (Object.values(n).find((v) => typeof v === "string") as string | undefined) ??
    ""
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type PageProps = {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
};

export default async function ProviderProfilePage({ params }: PageProps) {
  const { locale: localeParam, id } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, localeParam)) notFound();
  const locale = localeParam as Locale;
  setRequestLocale(locale);
  const t = await getTranslations();

  const profile = await getProfessionalProfile(id);
  if (!profile) notFound();

  const { reviews, total: totalReviews } = await getPublishedReviews(id);
  const trustBadges = await calculateTrustBadges(id);

  const qualityRated = reviews.filter((r: { quality_rating: number | null }) => r.quality_rating != null);
  const avgQuality = qualityRated.length > 0
    ? qualityRated.reduce((sum: number, r: { quality_rating: number | null }) => sum + (r.quality_rating ?? 0), 0) / qualityRated.length
    : null;

  const commRated = reviews.filter((r: { communication_rating: number | null }) => r.communication_rating != null);
  const avgCommunication = commRated.length > 0
    ? commRated.reduce((sum: number, r: { communication_rating: number | null }) => sum + (r.communication_rating ?? 0), 0) / commRated.length
    : null;

  const punctRated = reviews.filter((r: { punctuality_rating: number | null }) => r.punctuality_rating != null);
  const avgPunctuality = punctRated.length > 0
    ? punctRated.reduce((sum: number, r: { punctuality_rating: number | null }) => sum + (r.punctuality_rating ?? 0), 0) / punctRated.length
    : null;

  const displayName =
    profile.business_name?.trim() ||
    profile.profile?.full_name?.trim() ||
    t("pro.profile.newPro");

  const services = profile.services ?? [];
  const categories = Array.from(
    new Map(
      services
        .map((s) => s.category)
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => [c.id, c])
    ).values()
  );

  const rating = profile.avg_rating;
  const fullStars = Math.min(5, Math.round(rating));

  return (
    <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-24">
      <LocalBusinessSchema pro={profile as unknown as ProfessionalProfile} />
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.08 }}>
        <BackgroundGrids />
      </div>
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-teal-500/[0.04] to-transparent dark:from-teal-500/[0.06]" />
      <div className="relative">
      <SpotlightCard className="mb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {profile.profile?.avatar_url ? (
            <Image
              src={profile.profile.avatar_url}
              alt=""
              width={112}
              height={112}
              className="h-28 w-28 shrink-0 rounded-full object-cover ring-2 ring-teal-500/40"
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-teal-600 text-2xl font-semibold text-white shadow-inner"
              aria-hidden
            >
              {initialsFromName(displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl text-gray-900 dark:text-white sm:text-3xl">
                {displayName}
              </h1>
              {profile.is_verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400"
                  title={t("pro.profile.verified")}
                >
                  <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                  {t("pro.profile.verified")}
                </span>
              )}
              {trustBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {trustBadges.map((badge) => (
                    <TrustBadge key={badge} badge={badge} size="md" />
                  ))}
                </div>
              )}
            </div>
            {profile.location_city && (
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <MapPin className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                {profile.location_city}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-white/50">{t("pro.profile.rating")}</span>
              <div className="flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)}`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < fullStars
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-sm tabular-nums text-gray-700 dark:text-white/80">
                {rating.toFixed(1)} · {profile.total_reviews}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-white/65">
              {profile.years_experience != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                  {profile.years_experience} {t("pro.profile.yearsExp")}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                {profile.completed_jobs} {t("pro.profile.completedJobs")}
              </span>
              {profile.response_time_minutes != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                  {profile.response_time_minutes} {t("pro.profile.responseTime")}
                </span>
              )}
            </div>
            {profile.languages.length > 0 && (
              <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <Languages className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
                <span className="font-medium text-gray-700 dark:text-white/80">{t("pro.profile.languages")}:</span>
                {profile.languages.join(", ")}
              </p>
            )}
          </div>
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{profile.completed_jobs}</div>
          <div className="text-xs text-gray-500 dark:text-white/50">{t("pro.profile.completedJobs")}</div>
        </div>
        {profile.response_time_minutes != null && (
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{profile.response_time_minutes}m</div>
            <div className="text-xs text-gray-500 dark:text-white/50">{t("pro.profile.responseTime")}</div>
          </div>
        )}
        {profile.years_experience != null && (
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{profile.years_experience}</div>
            <div className="text-xs text-gray-500 dark:text-white/50">{t("pro.profile.yearsExp")}</div>
          </div>
        )}
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{rating.toFixed(1)}</div>
          <div className="text-xs text-gray-500 dark:text-white/50">{t("pro.profile.rating")}</div>
        </div>
      </div>

      <SpotlightCard className="mb-6">
        <h2 className="mb-3 font-serif text-xl text-gray-900 dark:text-white">{t("pro.profile.about")}</h2>
        <p className="whitespace-pre-wrap text-gray-600 dark:text-white/70">
          {profile.bio?.trim() || ""}
        </p>
      </SpotlightCard>

      <SpotlightCard className="mb-6">
        <h2 className="mb-4 font-serif text-xl text-gray-900 dark:text-white">{t("pro.profile.services")}</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/50">{t("pro.profile.noServices")}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-teal-600/15 px-3 py-1 text-sm font-medium text-teal-800 dark:bg-teal-500/20 dark:text-teal-300"
              >
                {labelForCategory(c, locale)}
              </span>
            ))}
          </div>
        )}
      </SpotlightCard>

      <SpotlightCard className="mb-6">
        <h2 className="mb-4 font-serif text-xl text-gray-900 dark:text-white">{t("pro.profile.portfolio")}</h2>
        {profile.portfolio_images.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-white/50">{t("pro.profile.noPortfolio")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.portfolio_images.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-gray-200 dark:ring-white/10">
                <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" unoptimized />
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>

      <SpotlightCard className="mb-8">
        <ReviewSection
          reviews={reviews as ReviewItem[]}
          totalReviews={totalReviews}
          avgRating={rating}
          avgQuality={avgQuality}
          avgCommunication={avgCommunication}
          avgPunctuality={avgPunctuality}
          professionalId={id}
          locale={locale}
        />
      </SpotlightCard>

      <div className="flex justify-center">
        <button
          type="button"
          disabled
          title={t("common.comingSoon")}
          className="bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25 text-white rounded-xl px-8 py-4 font-medium transition-all hover:shadow-xl hover:shadow-teal-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t("pro.profile.requestQuote")}
        </button>
      </div>
      </div>
    </div>
  );
}
