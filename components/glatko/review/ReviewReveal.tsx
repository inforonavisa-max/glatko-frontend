"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";

interface ReviewData {
  id: string;
  overall_rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  review_text: string | null;
  photos: string[];
  reviewer_role: string;
  created_at: string;
  reviewer: { full_name: string; avatar_url: string | null } | null;
}

interface ReviewRevealProps {
  customerReview: ReviewData | null;
  proReview: ReviewData | null;
  requestTitle?: string;
}

function ReviewCard({
  review,
  heading,
  delay,
}: {
  review: ReviewData;
  heading: string;
  delay: number;
}) {
  const t = useTranslations();
  const reviewer = review.reviewer;

  return (
    <motion.div
      initial={{ filter: "blur(16px)", opacity: 0, scale: 0.95 }}
      animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03]"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
        {heading}
      </p>

      {reviewer && (
        <div className="mb-4 flex items-center gap-3">
          {reviewer.avatar_url ? (
            <Image
              src={reviewer.avatar_url}
              alt={reviewer.full_name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-sm font-bold text-teal-600 dark:text-teal-400">
              {reviewer.full_name.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {reviewer.full_name}
          </span>
        </div>
      )}

      <div className="mb-4">
        <StarRating value={review.overall_rating} readonly size="md" />
      </div>

      {(review.quality_rating || review.communication_rating || review.punctuality_rating) && (
        <div className="mb-4 space-y-3 rounded-xl border border-gray-100/80 bg-white/40 p-4 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
          {review.quality_rating !== null && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 dark:text-white/40">
                {t("review.qualityRating")}
              </p>
              <StarRating value={review.quality_rating} readonly size="sm" />
            </div>
          )}
          {review.communication_rating !== null && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 dark:text-white/40">
                {t("review.communicationRating")}
              </p>
              <StarRating value={review.communication_rating} readonly size="sm" />
            </div>
          )}
          {review.punctuality_rating !== null && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 dark:text-white/40">
                {t("review.punctualityRating")}
              </p>
              <StarRating value={review.punctuality_rating} readonly size="sm" />
            </div>
          )}
        </div>
      )}

      {review.review_text && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/[0.02]">
          <p className="text-sm italic leading-relaxed text-gray-600 dark:text-white/60">
            &ldquo;{review.review_text}&rdquo;
          </p>
        </div>
      )}

      {review.photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {review.photos.map((url) => (
            <Image
              key={url}
              src={url}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
              unoptimized
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ReviewReveal({
  customerReview,
  proReview,
}: ReviewRevealProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-4xl"
    >
      <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {t("review.reveal.title")}
      </h1>
      <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />

      <div className={cn("mt-8 grid gap-6", (customerReview && proReview) && "md:grid-cols-2")}>
        {customerReview && (
          <ReviewCard
            review={customerReview}
            heading={t("review.reveal.customerReview")}
            delay={0}
          />
        )}
        {proReview && (
          <ReviewCard
            review={proReview}
            heading={t("review.reveal.proReview")}
            delay={0.2}
          />
        )}
      </div>
    </motion.div>
  );
}
