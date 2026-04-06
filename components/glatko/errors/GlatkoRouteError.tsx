"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export function GlatkoRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.error("[Glatko route error]", error.message, error.digest);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
        <span className="font-serif text-2xl text-red-500">!</span>
      </div>
      <h2 className="mt-5 font-serif text-xl text-gray-900 dark:text-white">
        {t("title")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-white/50">
        {t("description")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30"
      >
        {t("retry")}
      </button>
    </div>
  );
}
