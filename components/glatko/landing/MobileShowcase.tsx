"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { IPhoneMockup } from "./MobileMockup";

type MobileShowcaseProps = {
  title: string;
  subtitle: string;
};

export function MobileShowcase({ title, subtitle }: MobileShowcaseProps) {
  const t = useTranslations();

  const bullets = [
    {
      title: t("landing.deepFeatures.lang.title"),
      desc: t("landing.deepFeatures.lang.desc"),
    },
    {
      title: t("landing.deepFeatures.verified.title"),
      desc: t("landing.deepFeatures.verified.desc"),
    },
    {
      title: t("landing.deepFeatures.realtime.title"),
      desc: t("landing.deepFeatures.realtime.desc"),
    },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
          <ul className="flex flex-col gap-5">
            {bullets.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {b.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {b.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex justify-center"
        >
          <IPhoneMockup>
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center bg-[#0b1f23] p-6">
              <span className="text-2xl font-bold text-white">
                Glatko<span className="text-teal-500">.</span>
              </span>
              <p className="mt-2 text-center text-sm text-white/50">
                {t("brand.tagline")}
              </p>
              <div className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-center text-sm font-medium text-white">
                {t("nav.requestService")}
              </div>
            </div>
          </IPhoneMockup>
        </motion.div>
      </div>
    </section>
  );
}
