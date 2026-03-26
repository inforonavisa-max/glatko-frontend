"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ReviewPendingProps {
  requestTitle: string;
  otherHasReviewed: boolean;
}

export function ReviewPending({ requestTitle }: ReviewPendingProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-gray-200/50 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] md:p-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="relative mb-8"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500/10">
          <Clock className="h-12 w-12 text-teal-500" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border-2 border-teal-500/30"
        />
      </motion.div>

      <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {t("review.pending.title")}
      </h1>
      <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
      <p className="mt-3 text-sm text-gray-500 dark:text-white/40">
        {t("review.pending.subtitle")}
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 w-full rounded-2xl border border-gray-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
          {t("review.pending.request")}
        </p>
        <p className="mt-1.5 font-medium text-gray-900 dark:text-white">
          {requestTitle}
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mt-8 flex items-center gap-2 text-sm text-teal-500"
      >
        <span className="h-2 w-2 rounded-full bg-teal-500" />
        {t("review.pending.waiting")}
      </motion.div>

      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.05]"
      >
        {t("review.pending.backToDashboard")}
      </Link>
    </motion.div>
  );
}
