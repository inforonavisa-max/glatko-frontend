"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/aceternity/tooltip";
import {
  VerificationProofModal,
  type VerificationData,
} from "./VerificationProofModal";

interface Props {
  verificationData: VerificationData;
  size?: "sm" | "md";
}

/**
 * G-PRO-2 Faz 3 — VerifiedBadgeWithProof
 *
 * Replaces the inline `<TrustBadge badge="verified" />` on the provider
 * public profile with a click-aware variant: hover (desktop) shows the
 * Aceternity Pro Tooltip with a one-line summary, click opens the
 * VerificationProofModal with full proof.
 *
 * Other trust badges (top_pro / experienced / new_pro / fast_responder)
 * remain on the original TrustBadge component — only the verified pill
 * carries the proof affordance.
 *
 * Sources:
 *   - components/aceternity/tooltip.tsx (mobile-aware tooltip)
 *   - components/aceternity/modal.tsx (proof modal)
 */
export function VerifiedBadgeWithProof({
  verificationData,
  size = "md",
}: Props) {
  const t = useTranslations("verification");
  const sizeCls =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";
  const iconCls = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <VerificationProofModal
      verificationData={verificationData}
      trigger={
        <Tooltip
          content={
            <div className="space-y-1">
              <p className="font-semibold text-neutral-900 dark:text-white">
                {t("verifiedTooltip")}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {t("clickForDetails")}
              </p>
            </div>
          }
        >
          <span
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300 ${sizeCls}`}
          >
            <ShieldCheck className={iconCls} aria-hidden />
            <span>{t("verified")}</span>
          </span>
        </Tooltip>
      }
    />
  );
}
