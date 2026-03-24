"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { useTranslations } from "next-intl";

export interface StepPortfolioProps {
  t: ReturnType<typeof useTranslations>;
}

export function StepPortfolio({ t }: StepPortfolioProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t("pro.wizard.step3Title")}
      </h2>
      <p className="text-sm text-gray-500 dark:text-white/50">
        {t("pro.wizard.step3Desc")}
      </p>

      <div className="space-y-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8",
            "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]",
            "opacity-60 cursor-not-allowed"
          )}
        >
          <Upload className="h-8 w-8 text-gray-400 dark:text-white/30" />
          <p className="text-sm text-gray-500 dark:text-white/40">
            {t("pro.wizard.portfolioUpload")}
          </p>
          <span className="text-xs text-gray-400 dark:text-white/20">
            {t("pro.wizard.comingSoon")}
          </span>
        </div>

        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8",
            "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]",
            "opacity-60 cursor-not-allowed"
          )}
        >
          <Upload className="h-8 w-8 text-gray-400 dark:text-white/30" />
          <p className="text-sm text-gray-500 dark:text-white/40">
            {t("pro.wizard.documentsUpload")}
          </p>
          <span className="text-xs text-gray-400 dark:text-white/20">
            {t("pro.wizard.comingSoon")}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-4 py-3 text-sm text-teal-700 dark:text-teal-400">
        {t("pro.wizard.reviewNote")}
      </div>
    </div>
  );
}
