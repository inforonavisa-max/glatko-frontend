"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";

interface ReviewItem {
  id: string;
  overall_rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  review_text: string | null;
  photos: string[];
  created_at: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
  service_request: {
    title: string;
    category: { name: Record<string, string>; icon: string } | null;
  } | null;
}

interface ReviewSectionProps {
  reviews: ReviewItem[];
  totalReviews: number;
  avgRating: number;
  avgQuality: number | null;
  avgCommunication: number | null;
  avgPunctuality: number | null;
  professionalId: string;
  locale: string;
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function ReviewSection({
  reviews,
  totalReviews,
  avgRating,
  avgQuality,
  avgCommunication,
  avgPunctuality,
  locale,
}: ReviewSectionProps) {
  const t = useTranslations();

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const idx = Math.min(Math.max(Math.round(r.overall_rating), 1), 5) - 1;
      counts[idx]++;
    }
    return counts;
  }, [reviews]);

  const maxCount = Math.max(...distribution, 1);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-white/40">
          {t("ratings.noReviews")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.h2
        variants={fadeUp}
        className="font-serif text-2xl text-gray-900 dark:text-white"
      >
        {t("ratings.title")}
      </motion.h2>

      {/* Rating overview */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center gap-4"
      >
        <span className="text-5xl font-bold text-gray-900 dark:text-white">
          {avgRating.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <StarRating value={Math.round(avgRating)} readonly size="md" />
          <span className="text-sm text-gray-500 dark:text-white/40">
            ({totalReviews} {t("ratings.reviews")})
          </span>
        </div>
      </motion.div>

      {/* Distribution bars */}
      <motion.div variants={fadeUp} className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star - 1];
          const width = (count / maxCount) * 100;

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-right text-gray-500 dark:text-white/40">
                {star}★
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.6, delay: (5 - star) * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                />
              </div>
              <span className="w-8 text-gray-400 dark:text-white/30">
                {count}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* Sub-rating averages */}
      {(avgQuality !== null || avgCommunication !== null || avgPunctuality !== null) && (
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap gap-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]"
        >
          {avgQuality !== null && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-white/30">
                {t("review.qualityRating")}
              </p>
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgQuality)} readonly size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-white/60">
                  {avgQuality.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          {avgCommunication !== null && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-white/30">
                {t("review.communicationRating")}
              </p>
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgCommunication)} readonly size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-white/60">
                  {avgCommunication.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          {avgPunctuality !== null && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-white/30">
                {t("review.punctualityRating")}
              </p>
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgPunctuality)} readonly size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-white/60">
                  {avgPunctuality.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Review cards */}
      <motion.div variants={stagger} className="space-y-4">
        {reviews.map((review) => {
          const reviewer = review.reviewer;
          const catName =
            review.service_request?.category?.name?.[locale] ??
            review.service_request?.category?.name?.en;

          return (
            <motion.div
              key={review.id}
              variants={fadeUp}
              className={cn(
                "rounded-2xl border p-5 backdrop-blur-sm",
                "border-gray-200 bg-white/80",
                "dark:border-white/[0.08] dark:bg-white/[0.03]"
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {reviewer?.avatar_url ? (
                    <Image
                      src={reviewer.avatar_url}
                      alt={reviewer.full_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-400">
                      {reviewer?.full_name?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reviewer?.full_name ?? t("ratings.anonymous")}
                    </p>
                    {catName && (
                      <p className="text-xs text-gray-400 dark:text-white/30">
                        {catName}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-white/30">
                  {formatDate(review.created_at, locale)}
                </span>
              </div>

              <div className="mb-2">
                <StarRating value={review.overall_rating} readonly size="sm" />
              </div>

              {review.review_text && (
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-white/60">
                  {review.review_text}
                </p>
              )}

              {review.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {review.photos.map((url) => (
                    <Image
                      key={url}
                      src={url}
                      alt=""
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      unoptimized
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
