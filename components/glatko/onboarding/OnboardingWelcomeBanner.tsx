"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { dismissOnboardingWelcome } from "@/lib/actions/profile";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
};

const COLLAPSE_MS = 320;
const LOCAL_DISMISS_KEY = "glatko_welcome_dismissed_v1";

export function OnboardingWelcomeBanner({ displayName }: Props) {
  const t = useTranslations("onboarding");
  const [pending, startTransition] = useTransition();
  const reducedMotion = useReducedMotion();
  const [isClosing, setIsClosing] = useState(false);
  // Defensive layer (PR #25): the layout's onboarding_completed flag is
  // the canonical signal, but Next.js's revalidatePath("/", "layout")
  // doesn't always invalidate the RSC cache for the current page navigation
  // — the banner re-appears until the user navigates. localStorage gives
  // an immediate, browser-side "dismissed" signal that survives soft
  // reloads regardless of the server cache state.
  const [localDismissed, setLocalDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(LOCAL_DISMISS_KEY) === "1") {
        setLocalDismissed(true);
      }
    } catch {
      /* SSR / privacy mode — fall back to server-side flag */
    }
  }, []);

  function persistLocalDismiss() {
    try {
      window.localStorage.setItem(LOCAL_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function onDismiss() {
    persistLocalDismiss();
    if (reducedMotion) {
      startTransition(async () => {
        await dismissOnboardingWelcome();
      });
      setLocalDismissed(true);
      return;
    }
    setIsClosing(true);
  }

  useEffect(() => {
    if (!isClosing || reducedMotion) return;

    const id = window.setTimeout(() => {
      startTransition(async () => {
        const result = await dismissOnboardingWelcome();
        if (result && "error" in result && result.error) {
          setIsClosing(false);
        } else {
          setLocalDismissed(true);
        }
      });
    }, COLLAPSE_MS);

    return () => window.clearTimeout(id);
  }, [isClosing, reducedMotion]);

  if (localDismissed) return null;

  const title =
    displayName.trim().length > 0
      ? t("welcomeTitle", { name: displayName.trim() })
      : t("welcomeTitleAnonymous");

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
        isClosing ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "border-b border-teal-200/80 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-slate-800 shadow-sm transition-opacity duration-300 ease-in-out motion-reduce:transition-none",
            isClosing ? "opacity-0" : "opacity-100",
          )}
          role="region"
          aria-label={title}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{t("welcomeBody")}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href="/request-service"
                className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                {t("cta")}
              </Link>
              <button
                type="button"
                onClick={onDismiss}
                disabled={pending || isClosing}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-50"
              >
                {t("dismiss")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
