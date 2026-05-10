"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryOption {
  id: string;
  slug: string;
  name_tr: string;
  name_me: string;
  parent_id: string | null;
  parent_slug: string | null;
  parent_name_tr: string | null;
}

export interface SelectedService {
  category_id: string;
  is_primary: boolean;
}

interface Props {
  options: CategoryOption[];
  value: SelectedService[];
  onChange: (next: SelectedService[]) => void;
  disabled?: boolean;
}

/**
 * Multi-select with one primary radio. Categories grouped by parent.
 * Enforces "exactly one primary" by promoting the first selection to
 * primary automatically and demoting siblings when admin picks a new
 * primary star.
 */
export function ProviderCategorySelect({ options, value, onChange, disabled }: Props) {
  const [openParents, setOpenParents] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const byParent = new Map<string, CategoryOption[]>();
    for (const o of options) {
      if (!o.parent_id) continue;
      const arr = byParent.get(o.parent_id) ?? [];
      arr.push(o);
      byParent.set(o.parent_id, arr);
    }
    const parents = options
      .filter((o) => !o.parent_id)
      .map((p) => ({
        parent: p,
        kids: (byParent.get(p.id) ?? []).sort((a, b) =>
          a.name_tr.localeCompare(b.name_tr, "tr"),
        ),
      }))
      .sort((a, b) => a.parent.name_tr.localeCompare(b.parent.name_tr, "tr"));
    return parents;
  }, [options]);

  const selectedSet = useMemo(() => new Set(value.map((v) => v.category_id)), [value]);

  function toggle(categoryId: string) {
    if (selectedSet.has(categoryId)) {
      const next = value.filter((v) => v.category_id !== categoryId);
      // If we just removed the primary, promote the first remaining row.
      if (next.length > 0 && !next.some((v) => v.is_primary)) {
        next[0] = { ...next[0], is_primary: true };
      }
      onChange(next);
    } else {
      const isFirst = value.length === 0;
      onChange([
        ...value,
        { category_id: categoryId, is_primary: isFirst },
      ]);
    }
  }

  function setPrimary(categoryId: string) {
    if (!selectedSet.has(categoryId)) return;
    onChange(
      value.map((v) => ({ ...v, is_primary: v.category_id === categoryId })),
    );
  }

  function toggleOpen(parentId: string) {
    setOpenParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {grouped.map(({ parent, kids }) => {
        const open = openParents.has(parent.id);
        const selectedKidsCount = kids.filter((k) => selectedSet.has(k.id)).length;
        return (
          <div
            key={parent.id}
            className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
          >
            <button
              type="button"
              onClick={() => toggleOpen(parent.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {parent.name_tr}
                </span>
                {selectedKidsCount > 0 && (
                  <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
                    {selectedKidsCount}
                  </span>
                )}
              </div>
              {open ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {open && kids.length > 0 && (
              <ul className="border-t border-gray-100 px-2 py-2 dark:border-white/[0.04]">
                {kids.map((k) => {
                  const sel = selectedSet.has(k.id);
                  const isPri = value.find((v) => v.category_id === k.id)?.is_primary;
                  return (
                    <li key={k.id} className="flex items-center gap-2 py-1">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => toggle(k.id)}
                        className={cn(
                          "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                          sel
                            ? "bg-teal-500/10 text-teal-800 dark:text-teal-200"
                            : "hover:bg-gray-50 dark:hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            sel
                              ? "border-teal-500 bg-teal-500 text-white"
                              : "border-gray-300 dark:border-white/[0.15]",
                          )}
                        >
                          {sel && <Check className="h-3 w-3" />}
                        </span>
                        <span className="flex-1 truncate dark:text-white/80">
                          {k.name_tr}
                        </span>
                      </button>
                      {sel && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => setPrimary(k.id)}
                          aria-label="Birincil yap"
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                            isPri
                              ? "bg-amber-400/20 text-amber-700 dark:text-amber-300"
                              : "text-gray-300 hover:bg-gray-100 hover:text-amber-500 dark:hover:bg-white/[0.06]",
                          )}
                        >
                          <Star className={cn("h-3.5 w-3.5", isPri && "fill-amber-400")} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
      <p className="px-1 text-xs text-gray-500 dark:text-white/40">
        Yıldız = birincil kategori (bir tane olmalı). En az 1 alt kategori seç.
      </p>
    </div>
  );
}
