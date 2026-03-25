"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import { SearchBar } from "@/components/glatko/search/SearchBar";
import { FilterBar } from "@/components/glatko/search/FilterBar";
import { ProfessionalCard } from "@/components/glatko/search/ProfessionalCard";
import { searchProfessionalsAction, getSearchSuggestionsAction } from "./actions";

interface ProResult {
  id: string;
  business_name: string | null;
  bio: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  years_experience: number | null;
  location_city: string | null;
  languages: string[];
  is_verified: boolean;
  avg_rating: number;
  total_reviews: number;
  completed_jobs: number;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
  services?: { category?: { id: string; slug: string; name: Record<string, string>; icon: string | null } | null }[];
}

function ProvidersContent() {
  const t = useTranslations();
  const locale = useLocale();
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [category, setCategory] = useQueryState("category", parseAsString.withDefault(""));
  const [city, setCity] = useQueryState("city", parseAsString.withDefault(""));
  const [rating, setRating] = useQueryState("rating", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("rating"));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const [professionals, setProfessionals] = useState<ProResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPros = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchProfessionalsAction({
        locale,
        categorySlug: category || undefined,
        city: city || undefined,
        minRating: rating ? parseFloat(rating) : undefined,
        query: q || undefined,
        sortBy: (sort as "rating" | "reviews" | "newest" | "jobs") || "rating",
        page: page || 1,
        limit: 12,
      });
      setProfessionals(result.professionals as ProResult[]);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [locale, category, city, rating, q, sort, page]);

  useEffect(() => {
    loadPros();
  }, [loadPros]);

  const hasActiveFilters = !!(category || city || rating || q);

  function clearAll() {
    setCategory("");
    setCity("");
    setRating("");
    setQ("");
    setPage(1);
  }

  return (
    <PageBackground>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <SectionTitle subtitle={t("search.subtitle")}>
          {t("search.title")}
        </SectionTitle>

        <div className="mt-6">
          <SearchBar
            locale={locale}
            defaultValue={q}
            onSearch={(v) => { setQ(v); setPage(1); }}
            fetchSuggestions={getSearchSuggestionsAction}
          />
        </div>

        <FilterBar
          category={category}
          city={city}
          rating={rating}
          sort={sort}
          onCategoryChange={(v) => { setCategory(v); setPage(1); }}
          onCityChange={(v) => { setCity(v); setPage(1); }}
          onRatingChange={(v) => { setRating(v); setPage(1); }}
          onSortChange={(v) => { setSort(v); setPage(1); }}
          onClearAll={clearAll}
          hasActiveFilters={hasActiveFilters}
        />

        {!loading && total > 0 && (
          <p className="mt-6 text-sm text-gray-500 dark:text-white/40">
            {total} {t("search.results.professionals")} {t("search.results.showing")}
          </p>
        )}

        <div className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {!loading && professionals.length === 0 && (
            <GlassmorphCard hover={false} className="p-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10">
                  <Users className="h-8 w-8 text-teal-500/50" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("search.results.noResults")}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/40">
                  {t("search.results.noResultsDesc")}
                </p>
                <Link
                  href="/request-service"
                  className="mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/20"
                >
                  {t("search.results.requestInstead")}
                </Link>
              </div>
            </GlassmorphCard>
          )}

          {!loading && professionals.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro, i) => (
                <ProfessionalCard
                  key={pro.id}
                  pro={pro}
                  locale={locale}
                  index={i}
                />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, (page || 1) - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/[0.05]"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common.back")}
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                          : "text-gray-600 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, (page || 1) + 1))}
                disabled={(page || 1) >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/[0.05]"
              >
                {t("common.next")}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}
