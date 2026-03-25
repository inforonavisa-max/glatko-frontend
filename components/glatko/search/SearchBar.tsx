"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Search, Layers, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  locale: string;
  defaultValue?: string;
  onSearch?: (q: string) => void;
  fetchSuggestions?: (q: string, locale: string) => Promise<{ type: string; label: string; slug: string }[]>;
}

type Suggestion = { type: string; label: string; slug: string };

export function SearchBar({ locale, defaultValue = "", onSearch, fetchSuggestions }: SearchBarProps) {
  const t = useTranslations();
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doFetch = useCallback(
    async (q: string) => {
      if (q.length < 2 || !fetchSuggestions) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchSuggestions(q, locale);
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [locale, fetchSuggestions]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doFetch(value), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, doFetch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (onSearch) {
      onSearch(value);
    } else {
      router.push(`/providers?q=${encodeURIComponent(value)}`);
    }
  }

  const cats = suggestions.filter((s) => s.type === "category");
  const pros = suggestions.filter((s) => s.type === "professional");

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            placeholder={t("search.searchPlaceholder")}
            className="w-full rounded-2xl border border-gray-200/80 bg-white/90 py-4 pl-12 pr-4 text-sm text-gray-900 shadow-sm backdrop-blur-xl placeholder:text-gray-400 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:border-teal-500/40"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}
        </div>
      </form>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0c0c0c]/95"
          >
            {cats.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
                  {t("search.suggestions.categories")}
                </p>
              </div>
            )}
            {cats.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/[0.04]"
              >
                <Layers className="h-4 w-4 text-teal-500" />
                {s.label}
              </Link>
            ))}
            {pros.length > 0 && (
              <div className={cn("px-4 pt-3 pb-1", cats.length > 0 && "border-t border-gray-100 dark:border-white/[0.06]")}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
                  {t("search.suggestions.professionals")}
                </p>
              </div>
            )}
            {pros.map((s) => (
              <Link
                key={s.slug}
                href={`/provider/${s.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-white/70 dark:hover:bg-white/[0.04]"
              >
                <User className="h-4 w-4 text-teal-500" />
                {s.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
