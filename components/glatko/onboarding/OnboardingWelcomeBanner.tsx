"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { dismissOnboardingWelcome } from "@/lib/actions/profile";

type Props = {
  displayName: string;
};

export function OnboardingWelcomeBanner({ displayName }: Props) {
  const t = useTranslations("onboarding");
  const [pending, startTransition] = useTransition();

  function onDismiss() {
    startTransition(async () => {
      await dismissOnboardingWelcome();
    });
  }

  const title =
    displayName.trim().length > 0
      ? t("welcomeTitle", { name: displayName.trim() })
      : t("welcomeTitleAnonymous");

  return (
    <div
      className="border-b border-teal-200/80 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 text-slate-800 shadow-sm"
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
            disabled={pending}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-50"
          >
            {t("dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
