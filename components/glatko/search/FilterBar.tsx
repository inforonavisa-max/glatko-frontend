"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterBarProps {
  category: string;
  city: string;
  rating: string;
  sort: string;
  onCategoryChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onRatingChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

const cities = ["Budva", "Kotor", "Tivat", "Podgorica", "Herceg Novi", "Bar", "Ulcinj"];

export function FilterBar({
  category,
  city,
  rating,
  sort,
  onCategoryChange,
  onCityChange,
  onRatingChange,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}: FilterBarProps) {
  const t = useTranslations();

  return (
    <div className="sticky top-16 z-30 -mx-4 px-4 py-3 backdrop-blur-sm bg-[#F8F6F0]/80 dark:bg-[#0b1f23]/80 border-b border-gray-200/50 dark:border-white/[0.05]">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
            category
              ? "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300"
              : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60"
          )}
        >
          <option value="">{t("search.filters.allCategories")}</option>
          <option value="general-cleaning">{t("categories.home.generalCleaning")}</option>
          <option value="deep-cleaning">{t("categories.home.deepCleaning")}</option>
          <option value="villa-airbnb">{t("categories.home.villaAirbnb")}</option>
          <option value="renovation">{t("categories.home.renovation")}</option>
          <option value="painting">{t("categories.home.painting")}</option>
          <option value="electrical">{t("categories.home.electrical")}</option>
          <option value="plumbing">{t("categories.home.plumbing")}</option>
          <option value="captain-hire">{t("categories.boat.captainHire")}</option>
          <option value="antifouling">{t("categories.boat.antifouling")}</option>
          <option value="engine-service">{t("categories.boat.engineService")}</option>
          <option value="hull-cleaning">{t("categories.boat.hullCleaning")}</option>
        </select>

        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
            city
              ? "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300"
              : "border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60"
          )}
        >
          <option value="">{t("search.filters.allCities")}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {["", "4", "4.5"].map((val) => {
          const label = val === "" ? t("search.filters.allRatings")
            : val === "4" ? t("search.filters.rating4plus")
            : t("search.filters.rating45plus");
          return (
            <button
              key={val}
              onClick={() => onRatingChange(val)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                rating === val
                  ? "border-teal-500/50 bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/[0.08]"
              )}
            >
              {label}
            </button>
          );
        })}

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="ml-auto rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60"
        >
          <option value="rating">{t("search.filters.sortRating")}</option>
          <option value="reviews">{t("search.filters.sortReviews")}</option>
          <option value="newest">{t("search.filters.sortNewest")}</option>
          <option value="jobs">{t("search.filters.sortJobs")}</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          >
            <X className="h-3 w-3" />
            {t("search.filters.clearAll")}
          </button>
        )}
      </div>
    </div>
  );
}
