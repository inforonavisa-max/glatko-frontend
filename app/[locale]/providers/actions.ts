"use server";

import {
  searchProfessionals,
  getSearchSuggestions,
} from "@/lib/supabase/glatko.server";

export async function searchProfessionalsAction(params: {
  locale: string;
  categorySlug?: string;
  city?: string;
  minRating?: number;
  languages?: string[];
  query?: string;
  sortBy?: "rating" | "reviews" | "newest" | "jobs";
  page?: number;
  limit?: number;
}) {
  return searchProfessionals(params);
}

export async function getSearchSuggestionsAction(
  query: string,
  locale: string
) {
  return getSearchSuggestions(query, locale);
}
