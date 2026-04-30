"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
  github: "GitHub",
};

type Props = {
  providers: string[];
  onUseProvider: (provider: string) => void;
};

export function AccountLinkAlert({ providers, onUseProvider }: Props) {
  const t = useTranslations("auth.accountLink");
  const primary = providers[0] ?? "google";
  const label = PROVIDER_LABEL[primary] ?? primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/20 dark:bg-amber-500/10"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <div className="flex-1">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            {t("title", { provider: label })}
          </p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-300/80">
            {t("description", { provider: label })}
          </p>
          <button
            type="button"
            onClick={() => onUseProvider(primary)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:bg-amber-500 dark:hover:bg-amber-400"
          >
            {t("cta", { provider: label })}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
