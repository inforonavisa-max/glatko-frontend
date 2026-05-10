"use client";

import { cn } from "@/lib/utils";

/** Section wrapper used by every group on the admin provider form. */
export function FormSection({
  title,
  badge,
  hint,
  children,
}: {
  title: string;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {badge && (
          <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-300">
            {badge}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500 dark:text-white/50">{hint}</p>}
      {children}
    </section>
  );
}

/** Labeled field wrapper. Generic — admin provider form uses it for
 * inputs, selects, custom widgets. */
export function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-gray-600 dark:text-white/60">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] text-gray-500 dark:text-white/40">
          {hint}
        </span>
      )}
    </label>
  );
}

export const formInputCls = cn(
  "block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm",
  "placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30",
  "disabled:cursor-not-allowed disabled:opacity-60",
  "dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white",
);
