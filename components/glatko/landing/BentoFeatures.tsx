"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ClipboardList, MessageSquare, UserCheck, PartyPopper } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const features = [
  { icon: ClipboardList, titleKey: "step1Title", descKey: "step1Desc", span: "md:col-span-2" },
  { icon: MessageSquare, titleKey: "step2Title", descKey: "step2Desc", span: "" },
  { icon: UserCheck, titleKey: "step3Title", descKey: "step3Desc", span: "" },
  { icon: PartyPopper, titleKey: "step4Title", descKey: "step4Desc", span: "md:col-span-2" },
] as const;

export function BentoFeatures() {
  const t = useTranslations();
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:py-28">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          {t("landing.features.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-white/50">
          {t("landing.features.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.titleKey}
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={reduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900/85 dark:shadow-[0_1px_1px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.25)]",
              feature.span
            )}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/5 blur-2xl transition-all duration-500 group-hover:bg-teal-500/10 dark:bg-teal-500/10 dark:group-hover:bg-teal-500/20" />

            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 transition-colors group-hover:bg-teal-500/15 dark:bg-teal-500/15">
                <feature.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t(`landing.features.${feature.titleKey}`)}
                </h3>
              </div>

              <p className="text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
                {t(`landing.features.${feature.descKey}`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
