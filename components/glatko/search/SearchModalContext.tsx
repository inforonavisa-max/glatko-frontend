"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SearchModalContextValue {
  isOpen: boolean;
  open: (opts?: { initialQuery?: string }) => void;
  close: () => void;
  initialQuery: string;
}

const SearchModalContext = createContext<SearchModalContextValue | null>(null);

export function SearchModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const open = useCallback((opts?: { initialQuery?: string }) => {
    setInitialQuery(opts?.initialQuery ?? "");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInitialQuery("");
  }, []);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, open, close]);

  const value = useMemo(
    () => ({ isOpen, open, close, initialQuery }),
    [isOpen, open, close, initialQuery],
  );

  return (
    <SearchModalContext.Provider value={value}>{children}</SearchModalContext.Provider>
  );
}

export function useSearchModal(): SearchModalContextValue {
  const ctx = useContext(SearchModalContext);
  if (!ctx) {
    throw new Error("useSearchModal must be used inside <SearchModalProvider>");
  }
  return ctx;
}
