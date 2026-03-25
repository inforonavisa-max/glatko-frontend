"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Anchor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/types/glatko";
import type { Locale } from "@/i18n/routing";

interface Props {
  selectedMainId: string;
  setSelectedMainId: (id: string) => void;
  selectedSubId: string;
  setSelectedSubId: (id: string) => void;
  categories: ServiceCategory[];
  locale: Locale;
  t: (key: string) => string;
}

const PARENT_ICONS: Record<string, typeof Home> = {
  "home-services": Home,
  "boat-services": Anchor,
};

function catName(cat: ServiceCategory, locale: Locale): string {
  return cat.name[locale] ?? cat.name.en ?? cat.slug;
}

export function StepCategory({
  selectedMainId,
  setSelectedMainId,
  selectedSubId,
  setSelectedSubId,
  categories,
  locale,
  t,
}: Props) {
  const parents = categories.filter((c) => !c.parent_id);

  const selectedParent = parents.find((p) => p.id === selectedMainId);
  const children = selectedParent?.children ?? [];

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step1.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step1.subtitle")}
      </p>

      {/* ── Bento category cards — adapted from kit bento-grid-with-skeletons.tsx Card pattern ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {parents.map((parent) => {
          const Icon = PARENT_ICONS[parent.slug] ?? Home;
          const isSelected = selectedMainId === parent.id;
          return (
            <motion.button
              key={parent.id}
              type="button"
              onClick={() => setSelectedMainId(parent.id)}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl border p-6 text-left backdrop-blur-sm transition-all duration-300",
                isSelected
                  ? "border-teal-500/50 bg-teal-500/[0.04] shadow-lg shadow-teal-500/10 dark:border-teal-500/40 dark:bg-teal-500/[0.06]"
                  : "border-gray-200/60 bg-white/60 hover:border-teal-500/30 hover:shadow-md dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-teal-500/20"
              )}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/[0.04] blur-2xl transition-all duration-500 group-hover:bg-teal-500/[0.08] dark:bg-teal-500/[0.06] dark:group-hover:bg-teal-500/[0.12]" />

              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500"
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </motion.div>
              )}

              <div className="relative flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
                  isSelected
                    ? "bg-teal-500/15 dark:bg-teal-500/20"
                    : "bg-teal-500/10 dark:bg-teal-500/10"
                )}>
                  <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                    {catName(parent, locale)}
                  </h3>
                  {parent.description && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-white/50">
                      {parent.description[locale] ?? parent.description.en ?? ""}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Sub-categories chip grid — animated reveal ── */}
      <AnimatePresence>
        {selectedMainId && children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
                {t("request.step1.selectSub")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {children.map((child, i) => {
                  const isSelected = selectedSubId === child.id;
                  return (
                    <motion.button
                      key={child.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSubId(child.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                        isSelected
                          ? "border-teal-500/40 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:border-teal-500/30 dark:bg-teal-500/15 dark:text-teal-300"
                          : "border-gray-200/80 bg-white/60 text-gray-700 hover:border-teal-400/40 hover:bg-teal-50/50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-teal-500/20 dark:hover:bg-white/[0.06]"
                      )}
                    >
                      {catName(child, locale)}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
