"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapPin, Globe, Star, CheckCircle } from "lucide-react";
import { TrustBadge } from "@/components/glatko/trust/TrustBadge";
import type { Locale } from "@/i18n/routing";
import type { MultiLangText } from "@/types/glatko";

interface ProfessionalCardProps {
  pro: {
    id: string;
    business_name: string | null;
    bio: string | null;
    hourly_rate_min: number | null;
    hourly_rate_max: number | null;
    years_experience: number | null;
    location_city: string | null;
    languages: string[];
    is_verified: boolean;
    avg_rating: number;
    total_reviews: number;
    completed_jobs: number;
    profile?: { full_name: string | null; avatar_url: string | null } | null;
    services?: {
      category?: {
        id: string;
        slug: string;
        name: MultiLangText;
        icon: string | null;
      } | null;
    }[];
  };
  locale: string;
  index: number;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ProfessionalCard({ pro, locale, index }: ProfessionalCardProps) {
  const t = useTranslations();
  const displayName = pro.business_name || pro.profile?.full_name || t("pro.profile.newPro");
  const fullStars = Math.min(5, Math.round(pro.avg_rating));

  const categories = Array.from(
    new Map(
      (pro.services || [])
        .map((s) => s.category)
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => [c.id, c])
    ).values()
  );
  const visibleCats = categories.slice(0, 3);
  const moreCats = categories.length - 3;

  const badges: string[] = [];
  if (pro.is_verified) badges.push("verified");
  if (pro.avg_rating >= 4.8 && pro.completed_jobs >= 10) badges.push("top_pro");
  if (pro.completed_jobs >= 20) badges.push("experienced");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <div className="group h-full rounded-2xl border border-gray-200/50 bg-white/70 p-5 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/20 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03] md:p-6">
        <div className="flex items-start gap-4">
          {pro.profile?.avatar_url ? (
            <Image
              src={pro.profile.avatar_url}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded-full border-2 border-gray-200/60 object-cover dark:border-white/[0.1]"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gray-200/60 bg-teal-500/10 text-lg font-semibold text-teal-600 dark:border-white/[0.1] dark:text-teal-400">
              {initialsFromName(displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              {pro.is_verified && (
                <CheckCircle className="h-4 w-4 text-teal-500" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < fullStars
                        ? "fill-teal-500 text-teal-500"
                        : "text-gray-300 dark:text-white/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-white/50">
                {pro.avg_rating.toFixed(1)} ({pro.total_reviews})
              </span>
            </div>
            {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {badges.map((b) => (
                  <TrustBadge key={b} badge={b} size="sm" />
                ))}
              </div>
            )}
          </div>
        </div>

        {visibleCats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleCats.map((c) => {
              const name = (c.name as Record<string, string>)?.[locale as Locale] ||
                           (c.name as Record<string, string>)?.["en"] || "";
              return (
                <span
                  key={c.id}
                  className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-300"
                >
                  {name}
                </span>
              );
            })}
            {moreCats > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-white/[0.06] dark:text-white/40">
                +{moreCats} {t("search.card.moreServices")}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/50">
          {pro.location_city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-teal-500" />
              {pro.location_city}
            </span>
          )}
          {pro.languages.length > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-teal-500" />
              {pro.languages.map((l) => l.toUpperCase()).join(", ")}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm">
          {(pro.hourly_rate_min || pro.hourly_rate_max) && (
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              &euro;{pro.hourly_rate_min || 0}&ndash;{pro.hourly_rate_max || 0}{t("search.card.perHour")}
            </span>
          )}
          {pro.years_experience != null && pro.years_experience > 0 && (
            <span className="text-xs text-gray-400 dark:text-white/35">
              {pro.years_experience} {t("search.card.yearsExp")}
            </span>
          )}
        </div>

        <div className="mt-5 flex gap-2 border-t border-gray-100 pt-5 dark:border-white/[0.06]">
          <Link
            href={`/provider/${pro.id}`}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-xs font-medium text-gray-700 transition-all hover:border-teal-500/30 hover:text-teal-600 dark:border-white/[0.1] dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:text-teal-400"
          >
            {t("search.card.viewProfile")}
          </Link>
          <Link
            href="/request-service"
            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-teal-500/20 transition-all hover:shadow-teal-500/30"
          >
            {t("search.card.requestQuote")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
