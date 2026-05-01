"use client";

import { Image as ImageIcon, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortfolioUploader } from "./PortfolioUploader";

const PRICING_TYPES = ["hourly", "fixed", "per_unit"] as const;
type PricingType = (typeof PRICING_TYPES)[number];

export interface PricingModel {
  type: PricingType;
  baseRate: string;
  currency: "EUR";
}

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08]",
  "bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 text-sm",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all",
);

export interface StepPortfolioProps {
  userId: string;
  portfolioImages: string[];
  setPortfolioImages: (urls: string[]) => void;
  pricing: PricingModel;
  setPricing: (model: PricingModel) => void;
  t: (key: string) => string;
}

/**
 * G-PRO-1 Faz 4 — StepPortfolio rewrite (was a "Coming Soon" stub).
 * Now provides: portfolio image upload (PortfolioUploader, max 10) +
 * pricing model selection (hourly / fixed / per_unit + base rate EUR).
 */
export function StepPortfolio({
  userId,
  portfolioImages,
  setPortfolioImages,
  pricing,
  setPricing,
  t,
}: StepPortfolioProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          {t("becomePro.steps.portfolio")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/50">
          {t("becomePro.portfolio.subtitle")}
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon
            className="h-5 w-5 text-teal-600 dark:text-teal-400"
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("becomePro.portfolio.galleryTitle")}
          </h3>
        </div>
        <PortfolioUploader
          userId={userId}
          urls={portfolioImages}
          onChange={setPortfolioImages}
        />
      </section>

      <section className="rounded-2xl border border-gray-100/80 bg-white/40 p-5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="mb-4 flex items-center gap-2">
          <Wallet
            className="h-5 w-5 text-teal-600 dark:text-teal-400"
            aria-hidden
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t("becomePro.portfolio.pricingTitle")}
          </h3>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-white/45">
          {t("becomePro.portfolio.pricingHint")}
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-white/50">
              {t("becomePro.portfolio.pricingTypeLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICING_TYPES.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPricing({ ...pricing, type: pt })}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-medium transition-all",
                    pricing.type === pt
                      ? "border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/30"
                      : "border-gray-200 bg-white text-gray-700 hover:border-teal-500/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70",
                  )}
                >
                  {t(`becomePro.portfolio.pricingType.${pt}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="pro-base-rate"
              className="mb-2 block text-xs font-medium text-gray-500 dark:text-white/50"
            >
              {t("becomePro.portfolio.baseRateLabel")} (EUR)
            </label>
            <input
              id="pro-base-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={pricing.baseRate}
              onChange={(e) =>
                setPricing({ ...pricing, baseRate: e.target.value })
              }
              placeholder="0.00"
              className={inputCls}
            />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-white/40">
              {t(`becomePro.portfolio.baseRateHint.${pricing.type}`)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export type { PricingType };
