"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Anchor, ArrowRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type ServiceSubItem = { key: string; slug: string };

type TabbedServiceHeroProps = {
  homeItems: ServiceSubItem[];
  boatItems: ServiceSubItem[];
};

const TABS = [
  { id: "home" as const, categoryNs: "categories.home" as const },
  { id: "boat" as const, categoryNs: "categories.boat" as const },
];

export function TabbedServiceHero({
  homeItems,
  boatItems,
}: TabbedServiceHeroProps) {
  const t = useTranslations();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tab = TABS[selectedIndex];
  const items = selectedIndex === 0 ? homeItems : boatItems;
  const categoryParam =
    selectedIndex === 0 ? "home-services" : "boat-services";

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSelectedIndex((i) => (i + 1) % TABS.length);
    }, 12000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
    startInterval();
  };

  return (
    <div className="mb-12 w-full">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {t("services.title")}
        </h1>
        <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
        <p className="mt-4 text-sm text-gray-500 dark:text-white/50">
          {t("services.subtitle")}
        </p>
      </div>

      <motion.div className="relative my-4 flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 shadow-xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
        <div className="flex w-full items-center justify-start overflow-hidden bg-gray-100 py-3 pl-3 dark:bg-neutral-900/80">
          <div className="mr-4 flex shrink-0 items-center gap-2 pl-1">
            <div className="size-2.5 rounded-full bg-red-500" />
            <div className="size-2.5 rounded-full bg-yellow-500" />
            <div className="size-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex min-w-0 flex-1 flex-row items-center gap-2 overflow-x-auto py-0.5 pr-2">
            {TABS.map((tb, index) => (
              <div key={tb.id} className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabClick(index)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm",
                    selectedIndex === index
                      ? "bg-white text-gray-900 shadow ring-1 ring-black/5 dark:bg-neutral-800 dark:text-white dark:ring-white/10"
                      : "text-gray-600 hover:bg-white/80 dark:text-neutral-400 dark:hover:bg-neutral-800/80",
                  )}
                >
                  {tb.id === "home" ? (
                    <Home className="size-3.5 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <Anchor className="size-3.5 text-teal-600 dark:text-teal-400" />
                  )}
                  {t(`${tb.categoryNs}.title`)}
                </button>
                {index < TABS.length - 1 && (
                  <div className="h-4 w-px shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-gray-50/80 px-4 pb-6 pt-4 dark:bg-neutral-950/50">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col"
              >
                <p className="mb-3 text-sm text-gray-600 dark:text-white/55">
                  {t(`${tab.categoryNs}.description`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/providers?category=${s.slug}`}
                      className="rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs text-gray-700 transition-all hover:border-teal-500/40 hover:bg-teal-500/5 hover:text-teal-800 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:text-teal-300"
                    >
                      {t(`${tab.categoryNs}.${s.key}`)}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/providers?category=${categoryParam}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400"
                >
                  {t("services.viewAllPros")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`preview-${tab.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-teal-600/25 ring-1 ring-teal-500/20 dark:from-teal-500/15 dark:via-cyan-500/5 dark:to-teal-600/20"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="relative flex flex-col items-center gap-3 p-8 text-center">
                  {tab.id === "home" ? (
                    <Home className="size-20 text-teal-600/90 dark:text-teal-400" />
                  ) : (
                    <Anchor className="size-20 text-teal-600/90 dark:text-teal-400" />
                  )}
                  <span className="font-serif text-lg font-semibold text-gray-800 dark:text-white/90">
                    {t(`${tab.categoryNs}.title`)}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/request-service"
              className="inline-flex rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25"
            >
              {t("categories.getQuote")}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
