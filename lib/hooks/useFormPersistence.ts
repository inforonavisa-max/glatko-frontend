"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * G-REQ-1 Faz 5: localStorage persistence for the request wizard.
 *
 * Anonymous users can refresh, navigate away, and come back without
 * losing their progress (Airbnb-style). The hook serialises the
 * caller's full snapshot under a versioned key with a 24h TTL — older
 * drafts are dropped silently to avoid stale-shape compatibility bugs.
 *
 * The hook is intentionally generic over `T`: pass whatever object
 * shape captures the wizard's state, and a `restore(data)` callback
 * the parent uses to dispatch back into its individual `useState`
 * setters. Restore happens once on mount; saves are debounced 500 ms
 * to avoid hammering localStorage on every keystroke.
 *
 * `restored` flips to `true` when a draft was successfully reloaded so
 * the wizard can show a "draft restored" banner with a "start fresh"
 * escape hatch.
 */

const STORAGE_KEY_PREFIX = "glatko:request-draft:" as const;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 500;
const SCHEMA_VERSION = 1;

interface PersistedDraft<T> {
  data: T;
  timestamp: number;
  version: typeof SCHEMA_VERSION;
}

interface Options<T extends object> {
  key: string;
  enabled: boolean;
  snapshot: T;
  restore: (data: T) => void;
  ttlMs?: number;
}

interface Result {
  clearDraft: () => void;
  restored: boolean;
}

export function useFormPersistence<T extends object>({
  key,
  enabled,
  snapshot,
  restore,
  ttlMs = DEFAULT_TTL_MS,
}: Options<T>): Result {
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  const [hydrated, setHydrated] = useState(false);
  const [restored, setRestored] = useState(false);

  // Load on mount (single shot).
  useEffect(() => {
    if (!enabled) {
      setHydrated(true);
      return;
    }
    if (typeof window === "undefined") {
      setHydrated(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedDraft<T>;
        const expired = Date.now() - parsed.timestamp > ttlMs;
        const versionOk = parsed.version === SCHEMA_VERSION;
        if (!expired && versionOk && parsed.data) {
          restoreRef.current(parsed.data);
          setRestored(true);
        } else {
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // Bad JSON / quota / disabled — drop silently and start fresh.
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        /* noop */
      }
    } finally {
      setHydrated(true);
    }
    // We deliberately re-run only when the key/enabled flag changes;
    // re-running on every snapshot would clobber typed-in answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled, ttlMs]);

  // Debounced save on snapshot change.
  useEffect(() => {
    if (!enabled || !hydrated) return;
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      try {
        const draft: PersistedDraft<T> = {
          data: snapshot,
          timestamp: Date.now(),
          version: SCHEMA_VERSION,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Quota exceeded / disabled / private mode — silent fail.
      }
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, hydrated, snapshot, storageKey]);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    setRestored(false);
  }, [storageKey]);

  return { clearDraft, restored };
}
