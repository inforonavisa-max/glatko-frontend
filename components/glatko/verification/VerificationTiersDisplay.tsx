"use client";

import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type Tier = "basic" | "business" | "professional";

interface Props {
  currentTier?: Tier | null;
  /**
   * Per-document verified state (drives the per-tier missing-doc bullets).
   * Shape:
   *   { business_registration: bool, license: bool, insurance: bool }
   */
  docs?: {
    business_registration?: boolean;
    license?: boolean;
    insurance?: boolean;
  };
  /** Optional CTA target — link to upload missing docs / upgrade page. */
  ctaHref?: string;
  className?: string;
}

const TIER_ORDER: Tier[] = ["basic", "business", "professional"];

const TONE: Record<
  Tier,
  { ring: string; pill: string; check: string; text: string; bgFeatured: string }
> = {
  basic: {
    ring: "border-gray-200 dark:border-neutral-800",
    pill: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
    check: "bg-gray-700 dark:bg-neutral-600",
    text: "text-gray-900 dark:text-white",
    bgFeatured:
      "ring-2 ring-gray-400/40 dark:ring-neutral-500/40 shadow-md",
  },
  business: {
    ring: "border-emerald-200/60 dark:border-emerald-500/20",
    pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    check: "bg-emerald-600",
    text: "text-emerald-900 dark:text-emerald-200",
    bgFeatured:
      "ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10",
  },
  professional: {
    ring: "border-indigo-300/50 dark:border-indigo-400/30",
    pill: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    check: "bg-indigo-600",
    text: "text-indigo-900 dark:text-indigo-200",
    bgFeatured:
      "ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/15",
  },
};

/**
 * G-PRO-2 Faz 4 — VerificationTiersDisplay
 *
 * 3-tier card grid (Basic / Business / Professional) — adapts the
 * Aceternity Pro three-tier-pricing.tsx Card visual pattern (same
 * rounded-3xl shell, bordered inner panel, IconCheck step rows) to
 * verification tier requirements instead of pricing tiers.
 *
 * Surfaces:
 *   - Pro public profile (read-only context) — pass currentTier so the
 *     pro's tier card is highlighted.
 *   - /pro/dashboard/upgrade-tier — pass docs + ctaHref so missing
 *     requirements light up and the next-tier CTA appears.
 *
 * Tier names stay in English on purpose (Basic / Business / Professional)
 * — they're a brand vocabulary, not localized copy.
 */
export function VerificationTiersDisplay({
  currentTier = null,
  docs = {},
  ctaHref,
  className,
}: Props) {
  const t = useTranslations("verification");

  return (
    <div
      className={cn(
        "mx-auto grid grid-cols-1 gap-4 md:grid-cols-3",
        className,
      )}
    >
      {TIER_ORDER.map((tier) => {
        const tone = TONE[tier];
        const isCurrent = currentTier === tier;

        const requirements = REQUIREMENTS[tier].map((req) => ({
          key: req,
          met:
            req === "approved"
              ? true
              : req === "business_registration"
                ? Boolean(docs.business_registration)
                : req === "license"
                  ? Boolean(docs.license)
                  : req === "insurance"
                    ? Boolean(docs.insurance)
                    : false,
        }));

        return (
          <div
            key={tier}
            className={cn(
              "rounded-3xl border bg-gray-50/60 p-1 transition-shadow dark:border-neutral-800 dark:bg-neutral-900/60 sm:p-4",
              tone.ring,
              isCurrent && tone.bgFeatured,
            )}
          >
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl bg-white p-5 dark:bg-neutral-800">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-lg font-semibold", tone.text)}>
                    {TIER_LABEL[tier]}
                  </p>
                  {isCurrent && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        tone.pill,
                      )}
                    >
                      {t("currentTier")}
                    </span>
                  )}
                </div>
                <p className="mt-2 min-h-[40px] text-sm text-gray-600 dark:text-neutral-400">
                  {t(`tierDescription.${tier}`)}
                </p>
              </div>

              <div className="px-4 pb-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-500">
                  {t("tierRequirementsTitle")}
                </p>
                <ul className="space-y-3">
                  {requirements.map((r) => (
                    <li key={r.key} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          r.met ? tone.check : "bg-gray-300 dark:bg-neutral-700",
                        )}
                      >
                        <IconCheck className="h-3 w-3 stroke-[4px] text-white" />
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          r.met
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-neutral-500",
                        )}
                      >
                        {t(`tierRequirements.${r.key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {ctaHref && !isCurrent && tier !== "basic" && (
                <a
                  href={ctaHref}
                  className={cn(
                    "mx-4 mb-4 mt-auto inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5",
                    tier === "business"
                      ? "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-emerald-500/25"
                      : "bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-indigo-500/25",
                  )}
                >
                  {t("uploadMissingDocs")} →
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TIER_LABEL: Record<Tier, string> = {
  basic: "Basic",
  business: "Business",
  professional: "Professional",
};

const REQUIREMENTS: Record<
  Tier,
  Array<"approved" | "business_registration" | "license" | "insurance">
> = {
  basic: ["approved"],
  business: ["approved", "business_registration"],
  professional: ["approved", "business_registration", "license", "insurance"],
};
