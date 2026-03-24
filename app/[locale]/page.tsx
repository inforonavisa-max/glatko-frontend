"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  Home, Anchor, ClipboardList, MessageSquare, CheckCircle,
  Shield, Eye, Star, Globe, MapPin, Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function LandingPage() {
  const t = useTranslations();

  return (
    <>
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-400/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 dark:text-white leading-tight"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-white/60 max-w-2xl mx-auto"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="btn-teal text-sm px-8 py-3.5 rounded-xl">
              {t("hero.cta")}
            </Link>
            <a href="#categories" className="btn-ghost-teal text-sm px-8 py-3.5 rounded-xl">
              {t("hero.ctaSecondary")}
            </a>
          </motion.div>
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-8 text-sm text-gray-400 dark:text-white/40"
          >
            {t("hero.trustedBy")}
          </motion.p>
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm"
          >
            {[
              t("hero.stat.professionals"),
              t("hero.stat.completed"),
              t("hero.stat.rating"),
            ].map((stat) => (
              <span key={stat} className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 text-xs font-medium">
                {stat}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────── */}
      <section id="categories" className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 dark:text-white">
              {t("categories.title")}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-white/50">
              {t("categories.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Home Services Card */}
            <div className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 hover:border-teal-500/50 dark:hover:border-teal-500/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Home className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-sans">
                    {t("categories.home.title")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/50">
                    {t("categories.home.description")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {["generalCleaning", "deepCleaning", "villaAirbnb", "painting", "electrical", "plumbing"].map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/10">
                    {t(`categories.home.${s}`)}
                  </span>
                ))}
              </div>
              <a href="#" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                {t("categories.getQuote")} →
              </a>
            </div>

            {/* Boat Services Card */}
            <div className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 hover:border-teal-500/50 dark:hover:border-teal-500/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-sans">
                    {t("categories.boat.title")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/50">
                    {t("categories.boat.description")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {["captainHire", "antifouling", "engineService", "hullCleaning", "winterization", "charterPrep"].map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/10">
                    {t(`categories.boat.${s}`)}
                  </span>
                ))}
              </div>
              <a href="#" className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                {t("categories.getQuote")} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 dark:text-white">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-white/50">
              {t("howItWorks.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: ClipboardList, num: "01", key: "step1" },
              { icon: MessageSquare, num: "02", key: "step2" },
              { icon: CheckCircle, num: "03", key: "step3" },
            ].map((step) => (
              <div key={step.key} className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-teal-500" />
                </div>
                <span className="text-3xl font-bold text-teal-500/20">{step.num}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white font-sans">
                  {t(`howItWorks.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
                  {t(`howItWorks.${step.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Signals ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 dark:text-white">
              {t("trust.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, key: "verified" },
              { icon: Eye, key: "transparent" },
              { icon: Star, key: "reviews" },
              { icon: Globe, key: "multilingual" },
              { icon: MapPin, key: "local" },
              { icon: Zap, key: "free" },
            ].map((item) => (
              <div key={item.key} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white font-sans">
                    {t(`trust.${item.key}`)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                    {t(`trust.${item.key}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section id="cta-pro" className="py-24 px-4 bg-gray-50 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-10 text-center">
            <h3 className="font-serif text-2xl text-gray-900 dark:text-white">
              {t("cta.title")}
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
              {t("cta.subtitle")}
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block btn-teal text-sm px-8 py-3.5 rounded-xl"
            >
              {t("cta.button")}
            </Link>
          </div>
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-10 text-center">
            <h3 className="font-serif text-2xl text-gray-900 dark:text-white">
              {t("cta.pro.title")}
            </h3>
            <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
              {t("cta.pro.subtitle")}
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block btn-ghost-teal text-sm px-8 py-3.5 rounded-xl"
            >
              {t("cta.pro.button")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
