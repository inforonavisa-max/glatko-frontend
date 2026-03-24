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

  const charsRemaining = MAX_CHARS - reviewText.length;

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
      className="mx-auto max-w-2xl"
    >
      <h1 className="font-serif text-3xl bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent sm:text-4xl">
        {t("review.title")}
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-white/40">
        {t("review.subtitle")}
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-lg font-bold text-teal-400">
            {(otherPartyName ?? "?").charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{otherPartyName ?? "—"}</p>
          <p className="text-sm text-gray-500 dark:text-white/40">{requestTitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div>
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
            className="grid gap-6 sm:grid-cols-3"
          >
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
          </motion.div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/50">
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
              "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400",
              "dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder-white/20",
              "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
            )}
            placeholder={t("review.reviewTextPlaceholder")}
          />
          <p className="mt-1 text-right text-xs text-gray-400 dark:text-white/30">
            {charsRemaining} {t("review.charactersLeft")}
          </p>
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
            "w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3.5 text-sm font-medium text-white",
            "shadow-lg shadow-teal-500/25 transition-all",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "sm:w-auto sm:px-12"
          )}
        >
          <span className="inline-flex items-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("review.submitting") : t("review.submit")}
          </span>
        </motion.button>

        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
            <p className="text-xs leading-relaxed text-gray-600 dark:text-white/50">
              {t("review.simultaneousNote")}
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
