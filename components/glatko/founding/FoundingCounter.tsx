"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Crown, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/browser";

interface Counts {
  provider_count: number;
  provider_limit: number;
  provider_remaining: number;
  customer_count: number;
  customer_limit: number;
  customer_remaining: number;
}

interface Props {
  /** Optional initial counts (server-rendered). Skips loading state. */
  initialCounts?: Counts;
  className?: string;
}

/**
 * G-LAUNCH-1 — Founding programs live counter. Renders side-by-side
 * progress meters for the 50 / 100 caps using a public RPC
 * (glatko_founding_counts) so anyone — admin or visitor — can see them.
 *
 * On the admin /launch-metrics surface we pre-render counts server-side
 * via RPC; on the public landing pages we hydrate client-side.
 */
export function FoundingCounter({ initialCounts, className }: Props) {
  const t = useTranslations("founding.counter");
  const [counts, setCounts] = useState<Counts | null>(initialCounts ?? null);
  const [loading, setLoading] = useState(!initialCounts);

  useEffect(() => {
    if (initialCounts) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .rpc("glatko_founding_counts")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setCounts(data as unknown as Counts);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialCounts]);

  if (loading || !counts) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-gray-200/60 bg-white/70 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]",
          className,
        )}
      >
        <Loader2 className="h-5 w-5 animate-spin text-teal-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <CounterCard
        icon={Crown}
        title={t("providerTitle")}
        count={counts.provider_count}
        limit={counts.provider_limit}
        remaining={counts.provider_remaining}
        tone="amber"
      />
      <CounterCard
        icon={Star}
        title={t("customerTitle")}
        count={counts.customer_count}
        limit={counts.customer_limit}
        remaining={counts.customer_remaining}
        tone="indigo"
      />
    </div>
  );
}

function CounterCard({
  icon: Icon,
  title,
  count,
  limit,
  remaining,
  tone,
}: {
  icon: typeof Crown;
  title: string;
  count: number;
  limit: number;
  remaining: number;
  tone: "amber" | "indigo";
}) {
  const t = useTranslations("founding.counter");
  const pct = Math.min(100, Math.round((count / Math.max(limit, 1)) * 100));
  const palette =
    tone === "amber"
      ? {
          ring: "border-amber-300/40 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/[0.06]",
          fill: "bg-gradient-to-r from-amber-400 to-yellow-500",
          dot: "bg-amber-400",
          icon: "text-amber-600 dark:text-amber-400",
          label: "text-amber-900 dark:text-amber-300",
        }
      : {
          ring: "border-indigo-300/40 bg-indigo-50/80 dark:border-indigo-400/20 dark:bg-indigo-500/[0.06]",
          fill: "bg-gradient-to-r from-indigo-500 to-violet-500",
          dot: "bg-indigo-500",
          icon: "text-indigo-600 dark:text-indigo-400",
          label: "text-indigo-900 dark:text-indigo-300",
        };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 backdrop-blur-sm",
        palette.ring,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("h-5 w-5", palette.icon)} aria-hidden />
        <h3 className={cn("text-sm font-semibold", palette.label)}>{title}</h3>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
          {count}
        </span>
        <span className="text-sm text-gray-500 dark:text-white/40">/ {limit}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full", palette.fill)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-white/45">
        {remaining > 0
          ? t("remainingHint", { count: remaining })
          : t("filledHint")}
      </p>
    </div>
  );
}

export type { Counts as FoundingCounts };
