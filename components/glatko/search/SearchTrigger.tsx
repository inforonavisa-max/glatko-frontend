"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchModal } from "./SearchModalContext";
import { cn } from "@/lib/utils";

interface SearchTriggerProps {
  className?: string;
  variant?: "input" | "icon" | "hero";
}

export function SearchTrigger({ className, variant = "input" }: SearchTriggerProps) {
  const t = useTranslations("search.modal");
  const { open } = useSearchModal();

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => open()}
        className={cn(
          "rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
          className,
        )}
        aria-label={t("triggerLabel")}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={() => open()}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 text-left text-sm text-gray-500 shadow-sm backdrop-blur transition",
          "hover:border-teal-400 hover:bg-white hover:text-gray-700 hover:shadow-md",
          "dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-teal-400/60 dark:hover:bg-white/10 dark:hover:text-neutral-200",
          className,
        )}
        aria-label={t("triggerLabel")}
      >
        <Search className="h-5 w-5 shrink-0 text-teal-500" aria-hidden="true" />
        <span className="flex-1 truncate text-base">{t("triggerPlaceholder")}</span>
        <span className="ml-auto hidden items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-[11px] uppercase text-gray-500 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-neutral-500">
          {isMac ? "⌘" : "Ctrl"}+K
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className={cn(
        "group flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white/60 px-3 text-xs text-gray-500 transition",
        "hover:border-gray-300 hover:bg-white hover:text-gray-700",
        "dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200",
        className,
      )}
      aria-label={t("triggerLabel")}
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden lg:inline">{t("triggerPlaceholder")}</span>
      <span className="ml-auto hidden items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-gray-500 lg:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-neutral-500">
        {isMac ? "⌘" : "Ctrl"}+K
      </span>
    </button>
  );
}
