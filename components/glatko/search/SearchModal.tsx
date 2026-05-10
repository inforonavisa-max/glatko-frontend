"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Layers, User, Sparkles, Clock, X, Star, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import {
  searchAction,
  trendingCategoriesAction,
  recentSearchesAction,
  logRecentSearchAction,
  deleteRecentSearchAction,
  clearRecentSearchesAction,
} from "@/lib/actions/search";
import type {
  SearchResult,
  TrendingCategory,
  RecentSearch,
} from "@/types/glatko";
import { useSearchModal } from "./SearchModalContext";
import { FoundingProviderBadge } from "@/components/glatko/founding/FoundingProviderBadge";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  locale: string;
  isAuthenticated?: boolean;
}

type FlatItem =
  | { kind: "category"; data: SearchResult }
  | { kind: "professional"; data: SearchResult }
  | { kind: "trending"; data: TrendingCategory }
  | { kind: "recent"; data: RecentSearch };

function flattenForKeyboard(
  categories: SearchResult[],
  professionals: SearchResult[],
  trending: TrendingCategory[],
  recents: RecentSearch[],
  hasQuery: boolean,
): FlatItem[] {
  if (hasQuery) {
    return [
      ...categories.map((c) => ({ kind: "category" as const, data: c })),
      ...professionals.map((p) => ({ kind: "professional" as const, data: p })),
    ];
  }
  return [
    ...recents.map((r) => ({ kind: "recent" as const, data: r })),
    ...trending.map((t) => ({ kind: "trending" as const, data: t })),
  ];
}

export function SearchModal({ locale, isAuthenticated = false }: SearchModalProps) {
  const t = useTranslations("search.modal");
  const router = useRouter();
  const { isOpen, close, initialQuery } = useSearchModal();

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<SearchResult[]>([]);
  const [professionals, setProfessionals] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<TrendingCategory[]>([]);
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasQuery = query.trim().length >= 2;
  const flatItems = useMemo(
    () => flattenForKeyboard(categories, professionals, trending, recents, hasQuery),
    [categories, professionals, trending, recents, hasQuery],
  );

  // Reset & seed query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveIndex(0);
      // focus shortly after enter animation begins
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    } else {
      setCategories([]);
      setProfessionals([]);
      setActiveIndex(0);
    }
  }, [isOpen, initialQuery]);

  // Load empty-state data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const [tr, rec] = await Promise.all([
        trendingCategoriesAction(locale),
        isAuthenticated ? recentSearchesAction() : Promise.resolve([] as RecentSearch[]),
      ]);
      if (cancelled) return;
      setTrending(tr);
      setRecents(rec);
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, locale, isAuthenticated]);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;
    if (!hasQuery) {
      setCategories([]);
      setProfessionals([]);
      setLoading(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchAction(query, locale);
      setCategories(res.categories);
      setProfessionals(res.professionals);
      setActiveIndex(0);
      setLoading(false);
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, hasQuery, isOpen, locale]);

  const closeAndReset = useCallback(() => {
    setQuery("");
    setCategories([]);
    setProfessionals([]);
    setActiveIndex(0);
    close();
  }, [close]);

  const handleSelect = useCallback(
    async (item: FlatItem) => {
      if (item.kind === "category") {
        if (isAuthenticated) {
          await logRecentSearchAction({
            query,
            locale,
            resultClicked: "category",
            resultSlug: item.data.slug,
          });
        }
        router.push({ pathname: "/services/[slug]", params: { slug: item.data.slug } });
        closeAndReset();
      } else if (item.kind === "professional") {
        if (isAuthenticated) {
          await logRecentSearchAction({
            query,
            locale,
            resultClicked: "professional",
            resultSlug: item.data.slug,
          });
        }
        router.push({ pathname: "/pros/[slug]", params: { slug: item.data.slug } });
        closeAndReset();
      } else if (item.kind === "trending") {
        router.push({ pathname: "/services/[slug]", params: { slug: item.data.slug } });
        closeAndReset();
      } else if (item.kind === "recent") {
        if (item.data.resultClicked === "category" && item.data.resultSlug) {
          router.push({ pathname: "/services/[slug]", params: { slug: item.data.resultSlug } });
          closeAndReset();
        } else if (item.data.resultClicked === "professional" && item.data.resultSlug) {
          router.push({ pathname: "/pros/[slug]", params: { slug: item.data.resultSlug } });
          closeAndReset();
        } else {
          // Re-run the saved query
          setQuery(item.data.query);
          setActiveIndex(0);
        }
      }
    },
    [router, query, locale, isAuthenticated, closeAndReset],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeAndReset();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = flatItems[activeIndex];
        if (item) {
          e.preventDefault();
          void handleSelect(item);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, flatItems, activeIndex, handleSelect, closeAndReset]);

  const handleClearRecents = useCallback(async () => {
    await clearRecentSearchesAction();
    setRecents([]);
  }, []);

  const handleDeleteRecent = useCallback(async (id: string) => {
    await deleteRecentSearchAction(id);
    setRecents((rs) => rs.filter((r) => r.id !== id));
  }, []);

  if (!isOpen) {
    return null;
  }

  const totalResults = categories.length + professionals.length;
  const showEmpty = !hasQuery;
  const showNoResults = hasQuery && !loading && totalResults === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-start justify-center" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.button
          type="button"
          onClick={closeAndReset}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-label={t("close")}
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className={cn(
            "relative z-10 mt-0 flex h-screen w-screen flex-col bg-white text-gray-900 dark:bg-neutral-950 dark:text-white",
            "sm:mt-24 sm:h-auto sm:w-full sm:max-w-2xl sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl dark:sm:border-neutral-800",
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-gray-500 dark:text-neutral-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full bg-transparent text-base outline-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
              autoFocus
              aria-label={t("placeholder")}
            />
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-500 dark:text-neutral-400" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={closeAndReset}
              className="rounded-md p-1 text-gray-500 dark:text-neutral-400 transition hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto sm:max-h-[60vh]">
            {showEmpty && (
              <EmptyState
                t={t}
                trending={trending}
                recents={recents}
                isAuthenticated={isAuthenticated}
                flatItems={flatItems}
                activeIndex={activeIndex}
                onSelect={handleSelect}
                onClearRecents={handleClearRecents}
                onDeleteRecent={handleDeleteRecent}
              />
            )}

            {showNoResults && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-neutral-800 p-3">
                  <Search className="h-6 w-6 text-gray-400 dark:text-neutral-500" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-medium">{t("noResults")}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-neutral-300">{t("noResultsDesc")}</p>
              </div>
            )}

            {hasQuery && totalResults > 0 && (
              <ResultsList
                t={t}
                categories={categories}
                professionals={professionals}
                flatItems={flatItems}
                activeIndex={activeIndex}
                onSelect={handleSelect}
              />
            )}
          </div>

          {/* Footer keyboard hints (desktop only) */}
          <div className="hidden border-t border-gray-200 dark:border-neutral-800 px-4 py-2 text-[11px] text-gray-500 dark:text-neutral-400 sm:flex sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>{t("hints.navigate")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span>{t("hints.select")}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>esc</Kbd>
              <span>{t("hints.close")}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Subcomponents ─── */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] uppercase">
      {children}
    </kbd>
  );
}

function EmptyState({
  t,
  trending,
  recents,
  isAuthenticated,
  flatItems,
  activeIndex,
  onSelect,
  onClearRecents,
  onDeleteRecent,
}: {
  t: ReturnType<typeof useTranslations>;
  trending: TrendingCategory[];
  recents: RecentSearch[];
  isAuthenticated: boolean;
  flatItems: FlatItem[];
  activeIndex: number;
  onSelect: (item: FlatItem) => void;
  onClearRecents: () => void;
  onDeleteRecent: (id: string) => void;
}) {
  const recentStartIdx = 0;
  const trendingStartIdx = recents.length;
  return (
    <div className="px-2 py-3 sm:px-3">
      {isAuthenticated && recents.length > 0 && (
        <div className="mb-2">
          <SectionHeader
            icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}
            label={t("empty.recentTitle")}
            action={
              <button
                type="button"
                onClick={onClearRecents}
                className="text-[11px] font-medium text-gray-500 dark:text-neutral-400 transition hover:text-gray-900 dark:hover:text-white"
              >
                {t("empty.recentClear")}
              </button>
            }
          />
          <ul role="listbox">
            {recents.map((r, i) => {
              const idx = recentStartIdx + i;
              const isActive = idx === activeIndex;
              const item = flatItems[idx];
              return (
                <li key={r.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-2 py-2",
                      isActive && "bg-gray-100 dark:bg-neutral-800",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => item && onSelect(item)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-gray-400 dark:text-neutral-500" aria-hidden="true" />
                      <span className="truncate text-sm">{r.query}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecent(r.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                      aria-label={t("empty.recentRemove")}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <SectionHeader
            icon={<Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
            label={t("empty.popularTitle")}
          />
          <ul role="listbox" className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {trending.map((c, i) => {
              const idx = trendingStartIdx + i;
              const isActive = idx === activeIndex;
              const item = flatItems[idx];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => item && onSelect(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition",
                      isActive && "bg-gray-100 dark:bg-neutral-800",
                      "hover:bg-gray-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-neutral-800">
                      <Layers className="h-4 w-4 text-gray-600 dark:text-neutral-300" aria-hidden="true" />
                    </div>
                    <span className="flex-1 truncate text-sm font-medium">{c.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ResultsList({
  t,
  categories,
  professionals,
  flatItems,
  activeIndex,
  onSelect,
}: {
  t: ReturnType<typeof useTranslations>;
  categories: SearchResult[];
  professionals: SearchResult[];
  flatItems: FlatItem[];
  activeIndex: number;
  onSelect: (item: FlatItem) => void;
}) {
  const tFounding = useTranslations("founding.badge");
  const profStartIdx = categories.length;
  return (
    <div className="px-2 py-3 sm:px-3">
      {categories.length > 0 && (
        <div className="mb-2">
          <SectionHeader
            icon={<Layers className="h-3.5 w-3.5" aria-hidden="true" />}
            label={t("results.categoriesTitle")}
          />
          <ul role="listbox">
            {categories.map((c, i) => {
              const idx = i;
              const isActive = idx === activeIndex;
              const item = flatItems[idx];
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => item && onSelect(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition",
                      isActive && "bg-gray-100 dark:bg-neutral-800",
                      "hover:bg-gray-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-neutral-800">
                      <Layers className="h-4 w-4 text-gray-600 dark:text-neutral-300" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      {c.subtitle && (
                        <p className="truncate text-xs text-gray-600 dark:text-neutral-300">{c.subtitle}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {professionals.length > 0 && (
        <div>
          <SectionHeader
            icon={<User className="h-3.5 w-3.5" aria-hidden="true" />}
            label={t("results.professionalsTitle")}
          />
          <ul role="listbox">
            {professionals.map((p, i) => {
              const idx = profStartIdx + i;
              const isActive = idx === activeIndex;
              const item = flatItems[idx];
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => item && onSelect(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition",
                      isActive && "bg-gray-100 dark:bg-neutral-800",
                      "hover:bg-gray-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-neutral-800">
                      <User className="h-4 w-4 text-gray-600 dark:text-neutral-300" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium">{p.title}</p>
                        {p.isFoundingProvider ? (
                          <FoundingProviderBadge
                            iconOnly
                            size="sm"
                            number={p.foundingProviderNumber ?? undefined}
                            tooltipText={
                              p.foundingProviderNumber
                                ? tFounding("tooltip", {
                                    number: p.foundingProviderNumber,
                                  })
                                : undefined
                            }
                          />
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-neutral-300">
                        {typeof p.rating === "number" && p.rating > 0 && (
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                        {p.reviewCount ? <span>({p.reviewCount})</span> : null}
                        {p.city && <span className="truncate">· {p.city}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-2 pb-1">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-neutral-400">
        {icon}
        <span>{label}</span>
      </div>
      {action}
    </div>
  );
}
