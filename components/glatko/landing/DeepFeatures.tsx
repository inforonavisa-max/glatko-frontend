"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Languages, ShieldCheck, MessageCircle } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const features = [
  { icon: Languages, key: "lang", gradient: "from-blue-500/20 to-cyan-500/20" },
  { icon: ShieldCheck, key: "verified", gradient: "from-emerald-500/20 to-teal-500/20" },
  { icon: MessageCircle, key: "realtime", gradient: "from-violet-500/20 to-purple-500/20" },
] as const;

export function DeepFeatures() {
  const t = useTranslations();
  const reduced = useReducedMotion();

  return (
    <section className="bg-gray-50/50 py-20 dark:bg-white/[0.02] md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            {t("landing.deepFeatures.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-8 transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900"
            >
              <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} blur-3xl transition-all duration-500 group-hover:scale-125`} />

              <div className="relative">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 transition-all group-hover:border-teal-300 group-hover:bg-teal-100 dark:border-teal-500/20 dark:bg-teal-500/10">
                  <feature.icon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                </div>

                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {t(`landing.deepFeatures.${feature.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
                  {t(`landing.deepFeatures.${feature.key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
