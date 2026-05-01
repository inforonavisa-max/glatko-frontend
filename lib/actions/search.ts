"use server";

import {
  glatkoSearch,
  glatkoTrendingCategories,
  glatkoGetRecentSearches,
  glatkoLogRecentSearch,
  glatkoDeleteRecentSearch,
  glatkoClearRecentSearches,
} from "@/lib/supabase/glatko.server";
import type {
  RecentSearchClickType,
  SearchResponse,
  TrendingCategory,
  RecentSearch,
} from "@/types/glatko";

const VALID_LOCALES = ["tr", "en", "de", "it", "ru", "uk", "sr", "me", "ar"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function normalizeLocale(loc: string): ValidLocale {
  return (VALID_LOCALES as readonly string[]).includes(loc) ? (loc as ValidLocale) : "me";
}

export async function searchAction(
  query: string,
  locale: string,
): Promise<SearchResponse> {
  return glatkoSearch(query, normalizeLocale(locale));
}

export async function trendingCategoriesAction(
  locale: string,
): Promise<TrendingCategory[]> {
  return glatkoTrendingCategories(normalizeLocale(locale));
}

export async function recentSearchesAction(): Promise<RecentSearch[]> {
  return glatkoGetRecentSearches();
}

export async function logRecentSearchAction(input: {
  query: string;
  locale: string;
  resultClicked?: RecentSearchClickType | null;
  resultSlug?: string | null;
}): Promise<void> {
  return glatkoLogRecentSearch({
    ...input,
    locale: normalizeLocale(input.locale),
  });
}

export async function deleteRecentSearchAction(id: string): Promise<void> {
  return glatkoDeleteRecentSearch(id);
}

export async function clearRecentSearchesAction(): Promise<void> {
  return glatkoClearRecentSearches();
}
