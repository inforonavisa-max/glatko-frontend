"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
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
      className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10"
      >
        <CheckCircle className="h-10 w-10 text-teal-500" />
      </motion.div>

      <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
        {t("request.confirmation.title")}
      </h2>
      <p className="mt-2 text-gray-500 dark:text-white/50">
        {t("request.confirmation.subtitle")}
      </p>

      <div className="mt-8 w-full rounded-xl border border-gray-200 bg-gray-50 p-6 text-left dark:border-white/10 dark:bg-white/5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-white/50">
              {t("request.confirmation.category")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {requestSummary.category}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-white/50">
              {t("request.confirmation.city")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {requestSummary.city}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-white/50">
              {t("request.confirmation.urgency")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {requestSummary.urgency}
            </span>
          </div>
          {requestSummary.budget && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-white/50">
                {t("request.confirmation.budget")}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {requestSummary.budget}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/requests"
          className="flex flex-1 items-center justify-center rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-600"
        >
          {t("request.confirmation.goToRequests")}
        </Link>
        <button
          type="button"
          onClick={onCreateAnother}
          className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
        >
          {t("request.confirmation.createAnother")}
        </button>
      </div>
    </motion.div>
  );
}
