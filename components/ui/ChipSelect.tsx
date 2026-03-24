"use client";

import { cn } from "@/lib/utils";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  options: ChipOption[];
  value: string | string[];
  onChange: (value: string) => void;
  className?: string;
}

export function ChipSelect({
  options,
  value,
  onChange,
  className,
}: ChipSelectProps) {
  const selected = Array.isArray(value) ? value : [value];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95",
              isActive
                ? "border-teal-500 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:bg-teal-500/15 dark:text-teal-300"
                : "border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:bg-teal-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60 dark:hover:border-teal-500/25 dark:hover:bg-teal-500/5"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
