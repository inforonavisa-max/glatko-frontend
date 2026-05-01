import Image from "next/image";
import { Globe, Languages, MapPin, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FoundingProviderBadge } from "@/components/glatko/founding/FoundingProviderBadge";

interface Props {
  displayName: string;
  avatarUrl: string | null;
  city: string | null;
  languages: string[];
  yearsExperience: number | null;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  /** G-LAUNCH-1 — set when this pro is one of the first 50 approved. */
  isFoundingProvider?: boolean;
  foundingProviderNumber?: number | null;
  reviewsLabel: string;
  yearsLabel: string;
  verifiedLabel: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * G-LAUNCH-1 Faz 3 — Reusable hero card for /provider/[id]. Renders the
 * professional's avatar, name + verified + founding badges, star rating,
 * and meta strip (city / languages / experience).
 *
 * Standalone in this commit so PR #15's provider/[id]/page.tsx rewrite
 * stays untouched. Post-merge integration commit slots this in to replace
 * the current inline hero markup, picking up founding badge support for
 * free.
 */
export function ProfileHero({
  displayName,
  avatarUrl,
  city,
  languages,
  yearsExperience,
  rating,
  totalReviews,
  isVerified,
  isFoundingProvider = false,
  foundingProviderNumber = null,
  reviewsLabel,
  yearsLabel,
  verifiedLabel,
}: Props) {
  const fullStars = Math.min(5, Math.round(rating));
  return (
    <div className="relative mb-8 rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={112}
            height={112}
            className="h-28 w-28 shrink-0 rounded-full border-4 border-white object-cover shadow-2xl dark:border-[#0b1f23]"
          />
        ) : (
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-teal-500/20 text-3xl font-semibold text-teal-700 shadow-2xl dark:border-[#0b1f23] dark:text-teal-300"
            aria-hidden
          >
            {initials(displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {displayName}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {verifiedLabel}
              </span>
            )}
            {isFoundingProvider && (
              <FoundingProviderBadge
                number={foundingProviderNumber ?? undefined}
                size="md"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-0.5"
              role="img"
              aria-label={`${rating.toFixed(1)}`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < fullStars
                      ? "fill-teal-500 text-teal-500"
                      : "text-gray-300 dark:text-white/15",
                  )}
                  aria-hidden
                />
              ))}
            </div>
            <span className="text-sm font-medium tabular-nums text-gray-700 dark:text-white/80">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400 dark:text-white/40">
              ({totalReviews} {reviewsLabel})
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-white/60">
            {city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin
                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                  aria-hidden
                />
                {city}
              </span>
            )}
            {languages.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Languages
                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                  aria-hidden
                />
                {languages.join(", ")}
              </span>
            )}
            {yearsExperience !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Globe
                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                  aria-hidden
                />
                {yearsExperience} {yearsLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
