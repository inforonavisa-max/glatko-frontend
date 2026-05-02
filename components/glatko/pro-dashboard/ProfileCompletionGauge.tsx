"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** 0-100 score */
  score: number;
  /** Optional missing-fields hints (i18n-resolved labels). */
  missing?: string[];
  /** Compact (inline header) vs default (centered card). */
  variant?: "default" | "compact";
  className?: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * G-PRO-1 Faz 8 — Animated circular gauge (0-100%) showing pro profile
 * completion. Drives the "complete your profile" nudge surface in the
 * dashboard and the Step 6 review card.
 *
 * Score is computed by glatko_calculate_profile_completion() RPC; this
 * component just renders the value.
 */
export function ProfileCompletionGauge({
  score,
  missing,
  variant = "default",
  className,
}: Props) {
  const t = useTranslations("becomePro.completionGauge");
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = CIRCUMFERENCE - (safeScore / 100) * CIRCUMFERENCE;
  const tone =
    safeScore >= 80
      ? "from-teal-400 to-emerald-500"
      : safeScore >= 50
        ? "from-teal-400 to-cyan-500"
        : "from-amber-400 to-orange-500";

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-gray-200/60 bg-white/60 p-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]",
          className,
        )}
      >
        <div className="relative h-10 w-10 shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="-rotate-90 h-full w-full"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-gray-200 dark:stroke-white/10"
            />
            <motion.circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={cn("stroke-current", "text-teal-500")}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeDasharray={CIRCUMFERENCE}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums text-gray-900 dark:text-white">
            {safeScore}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-700 dark:text-white/70">
            {t("compactTitle", { score: safeScore })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-gray-200/60 bg-white/70 p-6 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="relative h-32 w-32">
        <svg
          viewBox="0 0 120 120"
          className="-rotate-90 h-full w-full"
          aria-label={t("ariaLabel", { score: safeScore })}
          role="img"
        >
          <defs>
            <linearGradient
              id="completion-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                className={cn(
                  "stop-color-current",
                  tone.split(" ")[0].replace("from-", "text-"),
                )}
              />
              <stop
                offset="100%"
                className={cn(
                  "stop-color-current",
                  tone.split(" ")[1].replace("to-", "text-"),
                )}
              />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            className="stroke-gray-100 dark:stroke-white/10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className={cn(
              "stroke-current bg-gradient-to-br",
              safeScore >= 80
                ? "text-emerald-500"
                : safeScore >= 50
                  ? "text-teal-500"
                  : "text-amber-500",
            )}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            strokeDasharray={CIRCUMFERENCE}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
            {safeScore}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-white/40">
            %
          </span>
        </div>
      </div>

      <h3 className="mt-4 font-serif text-lg font-semibold text-gray-900 dark:text-white">
        {t("title")}
      </h3>
      <p className="mt-1 text-center text-xs text-gray-500 dark:text-white/50">
        {safeScore >= 80
          ? t("subtitleHigh")
          : safeScore >= 50
            ? t("subtitleMid")
            : t("subtitleLow")}
      </p>

      {missing && missing.length > 0 && (
        <div className="mt-4 w-full rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-teal-500" aria-hidden />
            {t("missingTitle")}
          </div>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-white/50">
            {missing.map((m) => (
              <li key={m} className="flex items-start gap-1.5">
                <CheckCircle2
                  className="mt-0.5 h-3 w-3 shrink-0 text-gray-300 dark:text-white/20"
                  aria-hidden
                />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
