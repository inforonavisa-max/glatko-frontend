"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const faqKeys = ["1", "2", "3", "4", "5"] as const;

export function FAQ() {
  const t = useTranslations();
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-gray-50/50 py-20 dark:bg-white/[0.02] md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {t("landing.faq.title")}
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqKeys.map((key, index) => (
            <motion.div
              key={key}
              initial={reduced ? {} : { opacity: 0, y: 10 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center gap-3 px-6 py-5 text-left"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="shrink-0"
                >
                  <Plus className="h-5 w-5 text-teal-500" />
                </motion.div>
                <span className="text-sm font-medium text-gray-900 dark:text-white md:text-base">
                  {t(`landing.faq.q${key}`)}
                </span>
              </button>

              <AnimatePresence mode="sync">
                {openIndex === index && (
                  <motion.div
                    key={`content-${key}`}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: {
                        height: "auto",
                        opacity: 1,
                        transition: { type: "spring", stiffness: 400, damping: 40, mass: 1 },
                      },
                      collapsed: {
                        height: 0,
                        opacity: 0,
                        transition: { type: "spring", stiffness: 400, damping: 40, mass: 1 },
                      },
                    }}
                    className="overflow-hidden px-6"
                  >
                    <div className="pb-5 pl-8">
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
                        {t(`landing.faq.a${key}`)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
