"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Anchor,
  ClipboardList,
  MessageSquare,
  CheckCircle,
  Shield,
  Eye,
  Star,
  Globe,
  MapPin,
  Zap,
} from "lucide-react";
import { AceternityHeroBackground } from "@/components/aceternity/hero-background";
import { CollisionMechanism } from "@/components/aceternity/collision-beam";
import { CtaFeaturedImages } from "@/components/aceternity/featured-images";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { HeroStatChip } from "@/components/landing/stat-chip";
import {
  SectionReveal,
  StaggerItem,
  AnimatedStep,
} from "@/components/landing/scroll-reveal";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

const easePremium = [0.25, 0.4, 0.25, 1] as const;

export default function LandingPage() {
  const t = useTranslations();
  const reduced = useReducedMotion();
  const heroParentRef = useRef<HTMLDivElement>(null);
  const heroCollisionTargetRef = useRef<HTMLDivElement>(null);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.8,
        delay: reduced ? 0 : i * 0.15,
        ease: easePremium,
      },
    }),
  };

  const heroTitle = t("hero.title");
  const heroTitleWords = heroTitle.split(/\s+/).filter(Boolean);

  const heroStats = [
    { value: "100+", labelKey: "hero.stats.professionals" as const },
    { value: "500+", labelKey: "hero.stats.jobsCompleted" as const },
    { value: "4.9", labelKey: "hero.stats.avgRating" as const },
  ];

  const steps = [
    { icon: ClipboardList, key: "step1" as const },
    { icon: MessageSquare, key: "step2" as const },
    { icon: CheckCircle, key: "step3" as const },
  ];

  const trustItems = [
    { icon: Shield, key: "verified" as const },
    { icon: Eye, key: "transparent" as const },
    { icon: Star, key: "reviews" as const },
    { icon: Globe, key: "multilingual" as const },
    { icon: MapPin, key: "local" as const },
    { icon: Zap, key: "free" as const },
  ];

  return (
    <>
      {/* ── Hero — template `hero.tsx`: BackgroundGrids+mesh (hero-background), beams+collision, word blur (lines 72–99) ── */}
      <section
        ref={heroParentRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      >
        <AceternityHeroBackground />
        {!reduced && (
          <div
            className="pointer-events-none absolute inset-0 z-[5]"
            aria-hidden
          >
            <CollisionMechanism
              beamOptions={{
                initialX: -400,
                translateX: 600,
                duration: 7,
                repeatDelay: 3,
              }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
            <CollisionMechanism
              beamOptions={{
                initialX: -200,
                translateX: 800,
                duration: 4,
                repeatDelay: 3,
              }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
            <CollisionMechanism
              beamOptions={{
                initialX: 200,
                translateX: 1200,
                duration: 5,
                repeatDelay: 3,
              }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.h1 className="bg-gradient-to-b from-gray-900 via-gray-800 to-teal-800 bg-clip-text font-serif text-5xl font-light leading-[1.1] tracking-tight text-transparent dark:from-white dark:via-white/90 dark:to-teal-200/70 sm:text-6xl md:text-7xl lg:text-8xl">
            {!reduced ? (
              heroTitleWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
                  className="inline-block"
                >
                  {word}
                  {index < heroTitleWords.length - 1 ? "\u00A0" : ""}
                </motion.span>
              ))
            ) : (
              heroTitle
            )}
          </motion.h1>
          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-white/60 sm:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/register">
              <motion.span
                whileHover={
                  reduced
                    ? undefined
                    : { scale: 1.02, boxShadow: "0 0 30px rgba(20,184,166,0.3)" }
                }
                whileTap={reduced ? undefined : { scale: 0.98 }}
                className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-teal-500/25 transition-all"
              >
                {t("hero.cta")}
              </motion.span>
            </Link>
            <motion.a
              href="#categories"
              whileHover={
                reduced
                  ? undefined
                  : { scale: 1.02, backgroundColor: "rgba(20,184,166,0.1)" }
              }
              whileTap={reduced ? undefined : { scale: 0.98 }}
              className="inline-block rounded-xl border border-teal-500/30 px-8 py-4 text-lg font-medium text-teal-700 backdrop-blur-sm transition-all hover:border-teal-500/50 dark:text-teal-300"
            >
              {t("hero.ctaSecondary")}
            </motion.a>
          </motion.div>
          <div
            ref={heroCollisionTargetRef}
            className="min-h-[1px] w-full"
          >
            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-8 text-sm text-gray-500 dark:text-white/40"
            >
              {t("hero.trustedBy")}
            </motion.p>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm"
            >
              {heroStats.map((stat) => (
                <HeroStatChip key={stat.labelKey}>
                  {stat.value} {t(stat.labelKey)}
                </HeroStatChip>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────── */}
      <section id="categories" className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionReveal className="mb-16 text-center">
            <h2 className="font-serif text-3xl text-gray-900 dark:text-white sm:text-4xl">
              {t("categories.title")}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-white/50">
              {t("categories.subtitle")}
            </p>
          </SectionReveal>
          <div className="grid gap-8 md:grid-cols-2">
            <StaggerItem index={0}>
              <SpotlightCard>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                    <Home className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-sans text-xl font-semibold text-gray-900 dark:text-white">
                      {t("categories.home.title")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-white/50">
                      {t("categories.home.description")}
                    </p>
                  </div>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {[
                    "generalCleaning",
                    "deepCleaning",
                    "villaAirbnb",
                    "painting",
                    "electrical",
                    "plumbing",
                  ].map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                    >
                      {t(`categories.home.${s}`)}
                    </span>
                  ))}
                </div>
                <a
                  href="#"
                  className="text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  {t("categories.getQuote")} →
                </a>
              </SpotlightCard>
            </StaggerItem>
            <StaggerItem index={1}>
              <SpotlightCard>
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                    <Anchor className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-sans text-xl font-semibold text-gray-900 dark:text-white">
                      {t("categories.boat.title")}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-white/50">
                      {t("categories.boat.description")}
                    </p>
                  </div>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {[
                    "captainHire",
                    "antifouling",
                    "engineService",
                    "hullCleaning",
                    "winterization",
                    "charterPrep",
                  ].map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                    >
                      {t(`categories.boat.${s}`)}
                    </span>
                  ))}
                </div>
                <a
                  href="#"
                  className="text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400"
                >
                  {t("categories.getQuote")} →
                </a>
              </SpotlightCard>
            </StaggerItem>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section
        id="how-it-works"
        className="bg-gray-50 px-4 py-24 dark:bg-white/[0.02]"
      >
        <div className="mx-auto max-w-5xl">
          <SectionReveal className="mb-16 text-center">
            <h2 className="font-serif text-3xl text-gray-900 dark:text-white sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-white/50">
              {t("howItWorks.subtitle")}
            </p>
          </SectionReveal>

          <div className="relative md:pt-2">
            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-0.5 md:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,184,166,0.15), rgba(45,212,191,0.55), rgba(20,184,166,0.15))",
              }}
            />
            <div className="relative md:hidden">
              <div className="absolute bottom-6 left-[4.5rem] top-6 w-px bg-gradient-to-b from-teal-500/50 via-teal-400/40 to-teal-600/30" />
            </div>

            <div className="grid gap-10 md:grid-cols-3 md:gap-6">
              {steps.map((step, i) => (
                <AnimatedStep key={step.key} index={i}>
                  <div className="relative flex gap-5 pl-10 md:flex-col md:items-center md:pl-0 md:text-center">
                    <div className="absolute left-0 top-0 z-10 md:relative md:left-auto">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-xl font-bold text-white shadow-lg shadow-teal-500/25">
                        {i + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 pb-2">
                      <div className="mb-4 flex md:justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                          <step.icon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                        </div>
                      </div>
                      <h3 className="font-sans text-lg font-semibold text-gray-900 dark:text-white">
                        {t(`howItWorks.${step.key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
                        {t(`howItWorks.${step.key}.description`)}
                      </p>
                    </div>
                  </div>
                </AnimatedStep>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Signals ───────────────────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionReveal className="mb-16 text-center">
            <h2 className="font-serif text-3xl text-gray-900 dark:text-white sm:text-4xl">
              {t("trust.title")}
            </h2>
          </SectionReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustItems.map((item, i) => (
              <StaggerItem key={item.key} index={i}>
                <motion.div
                  className="group isolate flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] transition-shadow dark:border-white/10 dark:bg-neutral-900/85 dark:shadow-[0_1px_1px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.25)]"
                  whileHover={reduced ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <motion.div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 transition-all duration-300 group-hover:border-teal-300 group-hover:bg-teal-100 dark:border-teal-500/20 dark:bg-teal-500/10 dark:group-hover:border-teal-500/30 dark:group-hover:bg-teal-500/20 dark:group-hover:shadow-lg dark:group-hover:shadow-teal-500/10"
                        whileHover={reduced ? undefined : { scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <item.icon className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                      </motion.div>
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="font-sans font-semibold text-gray-900 dark:text-white">
                        {t(`trust.${item.key}`)}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                        {t(`trust.${item.key}Desc`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section
        id="cta-pro"
        className="relative overflow-hidden px-4 py-24"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.2),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(20,184,166,0.06),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-teal-50/30 dark:from-neutral-950/40 dark:via-transparent dark:to-teal-950/20" />
        <div className="relative mx-auto max-w-5xl">
          <SectionReveal className="mb-12">
            <CtaFeaturedImages
              caption={t("hero.trustedBy")}
              showStars
              textClassName="text-center md:text-left"
              className="md:justify-start justify-center items-center"
              containerClassName="md:items-start items-center"
            />
          </SectionReveal>
        </div>
        <div className="relative mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <SectionReveal>
            <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-10 text-center shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <h3 className="font-serif text-2xl text-gray-900 dark:text-white">
                {t("cta.title")}
              </h3>
              <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
                {t("cta.subtitle")}
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <motion.span
                  whileHover={
                    reduced
                      ? undefined
                      : { scale: 1.02, boxShadow: "0 0 30px rgba(20,184,166,0.3)" }
                  }
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-sm font-medium text-white shadow-lg shadow-teal-500/25"
                >
                  {t("cta.button")}
                </motion.span>
              </Link>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.08}>
            <div className="rounded-2xl border border-teal-500/25 bg-white/60 p-10 text-center shadow-lg backdrop-blur-md dark:border-teal-500/20 dark:bg-teal-500/5 dark:shadow-none">
              <h3 className="font-serif text-2xl text-gray-900 dark:text-white">
                {t("cta.pro.title")}
              </h3>
              <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
                {t("cta.pro.subtitle")}
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <motion.span
                  whileHover={
                    reduced
                      ? undefined
                      : { scale: 1.02, backgroundColor: "rgba(20,184,166,0.12)" }
                  }
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  className="inline-block rounded-xl border border-teal-500/40 px-8 py-4 text-sm font-medium text-teal-700 backdrop-blur-sm transition-all dark:border-teal-500/40 dark:text-teal-300"
                >
                  {t("cta.pro.button")}
                </motion.span>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
