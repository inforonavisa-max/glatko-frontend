"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface Props {
  /** Founding ordinal (1..50) — shown in tooltip. Optional. */
  number?: number;
  size?: Size;
  /** Hide the "Founding Provider" text label, show only the icon + ring. */
  iconOnly?: boolean;
  /**
   * Localized hover tooltip override. When provided, replaces the default
   * "Founding Provider [#N / 50]" string. Callers pass `t('founding.badge.tooltip', { number })`
   * from the surface that has next-intl access.
   */
  tooltipText?: string;
  className?: string;
}

const SIZES: Record<Size, { wrap: string; icon: string; text: string }> = {
  sm: { wrap: "px-2 py-0.5 text-[10px]", icon: "h-3 w-3", text: "text-[10px]" },
  md: { wrap: "px-2.5 py-1 text-xs", icon: "h-3.5 w-3.5", text: "text-xs" },
  lg: { wrap: "px-3.5 py-1.5 text-sm", icon: "h-4 w-4", text: "text-sm" },
};

/**
 * G-LAUNCH-1 — Founding Provider rozetı. Soft-launch'ın ilk 50 onaylı
 * pro'su için gold gradient + Crown icon + shimmer animation. Pro public
 * profile (provider/[id]), search results, dashboard kart vb. yüzeylerde
 * gösterilir.
 */
export function FoundingProviderBadge({
  number,
  size = "md",
  iconOnly = false,
  tooltipText,
  className,
}: Props) {
  const s = SIZES[size];
  const label = "Founding Provider";
  const tooltip =
    tooltipText ?? (number ? `${label} #${number} / 50` : label);

  return (
    <span
      title={tooltip}
      className={cn(
        "relative inline-flex items-center gap-1 overflow-hidden rounded-full font-medium",
        "border border-amber-300/60 dark:border-amber-400/30",
        "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500",
        "text-amber-950 shadow-md shadow-amber-500/20",
        "dark:from-amber-500 dark:via-yellow-400 dark:to-amber-600 dark:text-amber-950",
        s.wrap,
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-[shimmer_3s_ease-in-out_infinite]"
        style={{ animationName: "founding-shimmer" }}
      />
      <Crown className={cn(s.icon, "relative z-10 fill-amber-100/40")} aria-hidden />
      {!iconOnly && (
        <span className={cn("relative z-10 font-semibold tracking-tight", s.text)}>
          {number ? `Founding #${number}` : "Founding"}
        </span>
      )}
      <style>{`
        @keyframes founding-shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </span>
  );
}
