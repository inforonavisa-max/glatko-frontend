"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserSearchRow {
  id: string;
  full_name: string | null;
  email: string;
  is_pro: boolean;
}

interface Props {
  value: string | null;
  onChange: (userId: string | null, row: UserSearchRow | null) => void;
  /** Called by parent to fetch users matching the query. Should hit a
   * server action that runs `requireAdmin()`. */
  search: (query: string) => Promise<UserSearchRow[]>;
  disabled?: boolean;
}

/**
 * Combobox + debounced search for the promote-existing-user flow.
 * Disables `is_pro=true` rows so admins don't accidentally try to
 * "promote" a user that's already a pro.
 */
export function ProviderUserSearch({ value, onChange, search, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<UserSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<UserSearchRow | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setRows([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const next = await search(query.trim());
        setRows(next);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, search]);

  function pick(row: UserSearchRow) {
    if (row.is_pro) return;
    setSelected(row);
    onChange(row.id, row);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    setSelected(null);
    onChange(null, null);
  }

  const buttonLabel = useMemo(() => {
    if (selected) {
      return selected.full_name?.trim() || selected.email;
    }
    return "Kullanıcı seç…";
  }, [selected]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpen((v) => !v);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className={cn(
            "inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-sm",
            "hover:border-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white",
          )}
        >
          <span className={cn(!selected && "text-gray-400 dark:text-white/40")}>
            {buttonLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
        {value && (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-2 py-2 text-gray-400 hover:text-red-500 dark:border-white/[0.08]"
            aria-label="Temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {selected?.is_pro === false && (
        <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
          {selected.email}
        </p>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/[0.08] dark:bg-neutral-900">
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-white/[0.06]">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsim veya email ara (min 2 karakter)…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-white"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
          </div>
          {rows.length === 0 && query.trim().length >= 2 && !loading ? (
            <div className="px-3 py-4 text-sm text-gray-500 dark:text-white/40">
              Sonuç yok
            </div>
          ) : (
            <ul role="listbox" className="py-1">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={r.is_pro}
                    onClick={() => pick(r)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium dark:text-white">
                        {r.full_name?.trim() || "(adsız)"}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-white/40">
                        {r.email}
                      </p>
                    </div>
                    {r.is_pro && (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        zaten pro
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
