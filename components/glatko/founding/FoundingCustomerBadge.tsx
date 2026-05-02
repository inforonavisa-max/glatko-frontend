"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface Props {
  number?: number;
  size?: Size;
  iconOnly?: boolean;
  className?: string;
}

const SIZES: Record<Size, { wrap: string; icon: string; text: string }> = {
  sm: { wrap: "px-2 py-0.5 text-[10px]", icon: "h-3 w-3", text: "text-[10px]" },
  md: { wrap: "px-2.5 py-1 text-xs", icon: "h-3.5 w-3.5", text: "text-xs" },
  lg: { wrap: "px-3.5 py-1.5 text-sm", icon: "h-4 w-4", text: "text-sm" },
};

/**
 * G-LAUNCH-1 — Founding Customer rozetı. Soft-launch'ın ilk 100 müşterisi
 * (talep gönderen authenticated user) için indigo gradient + Star icon.
 * Customer dashboard, talep cards, review yazılırken gösterilir.
 */
export function FoundingCustomerBadge({
  number,
  size = "md",
  iconOnly = false,
  className,
}: Props) {
  const s = SIZES[size];
  const label = "Founding Customer";
  const tooltip = number ? `${label} #${number} / 100` : label;

  return (
    <span
      title={tooltip}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        "border border-indigo-300/60 dark:border-indigo-400/30",
        "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600",
        "text-white shadow-md shadow-indigo-500/25",
        "dark:from-indigo-500 dark:via-violet-500 dark:to-indigo-700",
        s.wrap,
        className,
      )}
    >
      <Star className={cn(s.icon, "fill-white/40")} aria-hidden />
      {!iconOnly && (
        <span className={cn("font-semibold tracking-tight", s.text)}>
          {number ? `Founding #${number}` : "Founding"}
        </span>
      )}
    </span>
  );
}
