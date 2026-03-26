"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const reviews = ["r1", "r2", "r3"] as const;

export function Testimonials() {
  const t = useTranslations();
  const reduced = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          style={reduced ? undefined : { willChange: "transform, opacity" }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {t("landing.testimonials.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((key, i) => (
            <motion.div
              key={key}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: Math.min(i, 7) * 0.12 }}
              style={reduced ? undefined : { willChange: "transform, opacity" }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-500/5 blur-sm group-hover:bg-teal-500/10 dark:bg-teal-500/10" />

              <div className="relative">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-neutral-300">
                  &ldquo;{t(`landing.testimonials.${key}.text`)}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 text-sm font-semibold text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                    {t(`landing.testimonials.${key}.name`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t(`landing.testimonials.${key}.name`)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {t(`landing.testimonials.${key}.city`)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
