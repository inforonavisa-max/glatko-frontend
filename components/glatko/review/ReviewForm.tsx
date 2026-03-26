"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import { submitReviewAction } from "@/app/[locale]/review/[requestId]/actions";

interface ReviewFormProps {
  serviceRequestId: string;
  bidId: string;
  revieweeId: string;
  reviewerRole: "customer" | "professional";
  otherPartyName: string | null;
  otherPartyAvatar: string | null;
  requestTitle: string;
}

const MAX_CHARS = 1000;

export function ReviewForm({
  serviceRequestId,
  bidId,
  revieweeId,
  reviewerRole,
  otherPartyName,
  otherPartyAvatar,
  requestTitle,
}: ReviewFormProps) {
  const t = useTranslations();
  const router = useRouter();

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overallRating === 0) return;

    setError("");
    setSubmitting(true);

    try {
      const result = await submitReviewAction({
        serviceRequestId,
        bidId,
        revieweeId,
        reviewerRole,
        overallRating,
        qualityRating: reviewerRole === "customer" && qualityRating > 0 ? qualityRating : undefined,
        communicationRating:
          reviewerRole === "customer" && communicationRating > 0 ? communicationRating : undefined,
        punctualityRating:
          reviewerRole === "customer" && punctualityRating > 0 ? punctualityRating : undefined,
        reviewText: reviewText.trim() || undefined,
        photos: [],
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? t("review.submitError"));
      }
    } catch {
      setError(t("review.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] md:p-10"
    >
      <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {t("review.title")}
      </h1>
      <div className="mt-1 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
      <p className="mt-3 text-sm text-gray-500 dark:text-white/40">
        {t("review.subtitle")}
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-200/60 bg-white/70 p-4 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        {otherPartyAvatar ? (
          <Image
            src={otherPartyAvatar}
            alt={otherPartyName ?? ""}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-lg font-bold text-teal-600 dark:text-teal-400">
            {(otherPartyName ?? "?").charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{otherPartyName ?? "—"}</p>
          <p className="text-sm text-gray-500 dark:text-white/40">{requestTitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="flex flex-col items-center justify-center py-4">
          <StarRating
            value={overallRating}
            onChange={setOverallRating}
            size="lg"
            label={t("review.overallRating")}
          />
        </div>

        {reviewerRole === "customer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="grid gap-6 sm:grid-cols-3">
              <StarRating
                value={qualityRating}
                onChange={setQualityRating}
                size="sm"
                label={t("review.qualityRating")}
              />
              <StarRating
                value={communicationRating}
                onChange={setCommunicationRating}
                size="sm"
                label={t("review.communicationRating")}
              />
              <StarRating
                value={punctualityRating}
                onChange={setPunctualityRating}
                size="sm"
                label={t("review.punctualityRating")}
              />
            </div>
          </motion.div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
            {t("review.reviewText")}
          </label>
          <textarea
            value={reviewText}
            onChange={(e) =>
              setReviewText(e.target.value.slice(0, MAX_CHARS))
            }
            maxLength={MAX_CHARS}
            rows={5}
            className={cn(
              "w-full resize-none rounded-2xl border px-4 py-3 text-sm transition-all",
              "border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400",
              "dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder-white/20",
              "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            )}
            placeholder={t("review.reviewTextPlaceholder")}
          />
          <div className="mt-1 flex justify-end">
            <p className="text-xs text-gray-400 dark:text-white/30">
              {reviewText.length} / {MAX_CHARS}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-teal-500/10 bg-teal-500/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
            <p className="text-xs leading-relaxed text-gray-600 dark:text-white/50">
              {t("review.simultaneousNote")}
            </p>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={submitting || overallRating === 0}
          className={cn(
            "w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3.5 text-sm font-semibold text-white",
            "shadow-lg shadow-teal-500/25 transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="inline-flex items-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("review.submitting") : t("review.submit")}
          </span>
        </motion.button>
      </form>
    </motion.div>
  );
}
