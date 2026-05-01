"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSearchModal } from "./SearchModalContext";

/**
 * Client-only helper that auto-opens the search modal when `?openSearch=1`
 * is present in the URL (e.g. via the /providers → /services?openSearch=1
 * 301 redirect). Strips the query param after firing so back-nav doesn't
 * re-open the modal.
 */
export function OpenSearchOnMount({ initialQueryParam = "openSearch" }: { initialQueryParam?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSearchModal();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (params.get(initialQueryParam) !== "1") return;
    fired.current = true;
    open({ initialQuery: params.get("q") ?? "" });
    // Strip the trigger param from the URL so navigation away/back doesn't reopen.
    const next = new URLSearchParams(params.toString());
    next.delete(initialQueryParam);
    next.delete("q");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, open, router, pathname, initialQueryParam]);

  return null;
}
