"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface Props {
  requestSummary: {
    category: string;
    city: string;
    urgency: string;
    budget?: string;
  };
  onCreateAnother: () => void;
  t: (key: string) => string;
}

export function RequestConfirmation({ requestSummary, onCreateAnother, t }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-lg flex-col items-center px-4 py-8 text-center sm:py-14"
    >
      {/* ── Animated SVG checkmark (teal, draw animation) ── */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/15"
      >
        <motion.svg
          viewBox="0 0 24 24"
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            className="text-teal-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.35 }}
          />
        </motion.svg>
      </motion.div>

      <h2 className="mt-6 font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {t("request.confirmation.title")}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
        {t("request.confirmation.subtitle")}
      </p>

      {/* ── Summary card — glassmorphism ── */}
      <div className="mt-8 w-full rounded-2xl border border-gray-200/60 bg-white/70 p-6 text-left backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="space-y-4">
          {[
            { label: t("request.confirmation.category"), value: requestSummary.category },
            { label: t("request.confirmation.city"), value: requestSummary.city },
            { label: t("request.confirmation.urgency"), value: requestSummary.urgency },
            requestSummary.budget
              ? { label: t("request.confirmation.budget"), value: requestSummary.budget }
              : null,
          ]
            .filter(Boolean)
            .map((item) => (
              <div key={item!.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-white/40">
                  {item!.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item!.value}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* ── Action buttons — D1 teal gradient + outline ── */}
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/requests"
          className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30"
        >
          {t("request.confirmation.goToRequests")}
        </Link>
        <button
          type="button"
          onClick={onCreateAnother}
          className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-white/[0.08] dark:text-white/70 dark:hover:bg-white/[0.04]"
        >
          {t("request.confirmation.createAnother")}
        </button>
      </div>
    </motion.div>
  );
}
