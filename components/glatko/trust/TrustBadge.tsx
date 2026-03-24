"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, Award, Trophy, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  badge: string;
  size?: "sm" | "md";
}

const badgeConfig = {
  verified: {
    Icon: ShieldCheck,
    colors: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    key: "trust.verified" as const,
  },
  top_pro: {
    Icon: Award,
    colors: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    key: "trust.topPro" as const,
  },
  experienced: {
    Icon: Trophy,
    colors: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    key: "trust.experienced" as const,
  },
  new_pro: {
    Icon: Sparkles,
    colors: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    key: "trust.newPro" as const,
  },
  fast_responder: {
    Icon: Zap,
    colors: "bg-green-500/10 text-green-400 border-green-500/20",
    key: "trust.fastResponder" as const,
  },
} as const;

type BadgeKey = keyof typeof badgeConfig;

function isBadgeKey(value: string): value is BadgeKey {
  return value in badgeConfig;
}

export function TrustBadge({ badge, size = "md" }: TrustBadgeProps) {
  const t = useTranslations();

  if (!isBadgeKey(badge)) return null;

  const { Icon, colors, key } = badgeConfig[badge];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        colors,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {t(key)}
    </span>
  );
}
