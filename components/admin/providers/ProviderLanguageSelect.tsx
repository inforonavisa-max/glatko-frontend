"use client";

import { Check } from "lucide-react";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/validations/admin/provider";
import { cn } from "@/lib/utils";

const LABELS: Record<SupportedLocale, string> = {
  tr: "Türkçe",
  en: "English",
  me: "Crnogorski",
  sr: "Srpski",
  de: "Deutsch",
  it: "Italiano",
  ru: "Русский",
  uk: "Українська",
  ar: "العربية",
};

interface Props {
  value: SupportedLocale[];
  onChange: (next: SupportedLocale[]) => void;
  disabled?: boolean;
}

export function ProviderLanguageSelect({ value, onChange, disabled }: Props) {
  function toggle(loc: SupportedLocale) {
    if (value.includes(loc)) {
      onChange(value.filter((v) => v !== loc));
    } else {
      onChange([...value, loc]);
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {SUPPORTED_LOCALES.map((loc) => {
        const sel = value.includes(loc);
        return (
          <button
            type="button"
            key={loc}
            disabled={disabled}
            onClick={() => toggle(loc)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              sel
                ? "border-teal-500 bg-teal-500/10 text-teal-800 dark:text-teal-200"
                : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-white/[0.1] dark:text-white/70",
            )}
          >
            {sel && <Check className="h-3 w-3" />}
            {LABELS[loc]}
            <span className="text-xs uppercase opacity-60">{loc}</span>
          </button>
        );
      })}
    </div>
  );
}
