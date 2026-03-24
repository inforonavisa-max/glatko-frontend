"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeroStatChipProps = {
  children: ReactNode;
  className?: string;
};

export function HeroStatChip({ children, className }: HeroStatChipProps) {
  return (
    <div
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md",
        "border-gray-200 bg-gray-50 text-gray-700",
        "dark:border-white/10 dark:bg-white/5 dark:text-white/70",
        className
      )}
    >
      {children}
    </div>
  );
}
