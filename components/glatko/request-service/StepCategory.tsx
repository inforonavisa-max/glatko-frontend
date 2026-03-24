"use client";

import { Home, Anchor } from "lucide-react";
import { SpotlightCard } from "@/components/landing/spotlight-card";
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
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step1.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step1.subtitle")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {parents.map((parent) => {
          const Icon = PARENT_ICONS[parent.slug] ?? Home;
          const isSelected = selectedMainId === parent.id;
          return (
            <button
              key={parent.id}
              type="button"
              onClick={() => setSelectedMainId(parent.id)}
              className="text-left"
            >
              <SpotlightCard
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected &&
                    "ring-2 ring-teal-500 dark:ring-teal-400"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                    <Icon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {catName(parent, locale)}
                    </h3>
                    {parent.description && (
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-white/50">
                        {parent.description[locale] ?? parent.description.en ?? ""}
                      </p>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </button>
          );
        })}
      </div>

      {selectedMainId && children.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-white/70">
            {t("request.step1.selectSub")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => {
              const isSelected = selectedSubId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedSubId(child.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-teal-500 bg-teal-500 text-white shadow-sm shadow-teal-500/25"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/10"
                  )}
                >
                  {catName(child, locale)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
