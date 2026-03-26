"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Home, Anchor } from "lucide-react";
import { AceternityHeroBackground } from "@/components/aceternity/hero-background";
import { LinesGradient } from "@/components/aceternity/lines-gradient";
import { CollisionMechanism } from "@/components/aceternity/collision-beam";
import { LazyAnimation } from "@/components/ui/LazyAnimation";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { HeroStatChip } from "@/components/landing/stat-chip";
import {
  SectionReveal,
  StaggerItem,
} from "@/components/landing/scroll-reveal";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { LogoMarquee } from "@/components/glatko/landing/LogoMarquee";
import { BentoFeatures } from "@/components/glatko/landing/BentoFeatures";
import { DeepFeatures } from "@/components/glatko/landing/DeepFeatures";
import { Testimonials } from "@/components/glatko/landing/Testimonials";
import { FAQ } from "@/components/glatko/landing/FAQ";
import { DashedGridCTA } from "@/components/glatko/landing/DashedGridCTA";
import { ImagesCTA } from "@/components/glatko/landing/ImagesCTA";
import { MobileShowcase } from "@/components/glatko/landing/MobileShowcase";

const easePremium = [0.25, 0.4, 0.25, 1] as const;

export default function LandingPageClient() {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Glatko",
            url: "https://glatko.app",
            logo: "https://glatko.app/favicon.svg",
            description: "Montenegro's Premier Service Platform",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Budva",
              addressCountry: "ME",
            },
            sameAs: [],
          }),
        }}
      />

      {/* ── Hero ── */}
      <section
        ref={heroParentRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-30"
          aria-hidden
        >
          <LinesGradient />
        </div>
        <AceternityHeroBackground />
        {!reduced && (
          <LazyAnimation
            className="pointer-events-none absolute inset-0 z-[5]"
            aria-hidden
          >
            <CollisionMechanism
              beamOptions={{ initialX: -400, translateX: 600, duration: 7, repeatDelay: 3 }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
            <CollisionMechanism
              beamOptions={{ initialX: -200, translateX: 800, duration: 4, repeatDelay: 3 }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
            <CollisionMechanism
              beamOptions={{ initialX: 200, translateX: 1200, duration: 5, repeatDelay: 3 }}
              containerRef={heroCollisionTargetRef}
              parentRef={heroParentRef}
            />
          </LazyAnimation>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.h1 className="bg-gradient-to-b from-gray-900 via-gray-800 to-teal-800 bg-clip-text font-serif text-5xl font-light leading-[1.1] tracking-tight text-transparent dark:from-white dark:via-white/90 dark:to-teal-200/70 sm:text-6xl md:text-7xl lg:text-8xl">
            {!reduced ? (
              heroTitleWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  style={{ willChange: "transform, opacity" }}
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
            style={reduced ? undefined : { willChange: "transform, opacity" }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-white/60 sm:text-xl"
          >
            {t("hero.subtitle")}
          </motion.p>
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            custom={2}
            style={reduced ? undefined : { willChange: "transform, opacity" }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/request-service">
              <motion.span
                whileHover={reduced ? undefined : { scale: 1.02, boxShadow: "0 0 30px rgba(20,184,166,0.3)" }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-teal-500/25 transition-all"
              >
                {t("hero.cta")}
              </motion.span>
            </Link>
            <Link href="/providers">
              <motion.span
                whileHover={reduced ? undefined : { scale: 1.02, backgroundColor: "rgba(20,184,166,0.1)" }}
                whileTap={reduced ? undefined : { scale: 0.98 }}
                className="inline-block rounded-xl border border-teal-500/30 px-8 py-4 text-lg font-medium text-teal-700 backdrop-blur-sm transition-all hover:border-teal-500/50 dark:text-teal-300"
              >
                {t("search.title")}
              </motion.span>
            </Link>
          </motion.div>
          <div ref={heroCollisionTargetRef} className="min-h-[1px] w-full">
            <motion.p
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={3}
              style={reduced ? undefined : { willChange: "transform, opacity" }}
              className="mt-8 text-sm text-gray-500 dark:text-white/40"
            >
              {t("hero.trustedBy")}
            </motion.p>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              custom={4}
              style={reduced ? undefined : { willChange: "transform, opacity" }}
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

      {/* ── Logo Cloud (marquee) — from blocks/logo-clouds/logo-cloud-marquee.tsx ── */}
      <LogoMarquee />

      {/* ── Categories ── */}
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
                  {["generalCleaning", "deepCleaning", "villaAirbnb", "painting", "electrical", "plumbing"].map((s) => (
                    <span key={s} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      {t(`categories.home.${s}`)}
                    </span>
                  ))}
                </div>
                <Link href="/services/home-services" className="text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400">
                  {t("categories.getQuote")} →
                </Link>
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
                  {["captainHire", "antifouling", "engineService", "hullCleaning", "winterization", "charterPrep"].map((s) => (
                    <span key={s} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      {t(`categories.boat.${s}`)}
                    </span>
                  ))}
                </div>
                <Link href="/services/boat-services" className="text-sm font-semibold text-teal-600 hover:underline dark:text-teal-400">
                  {t("categories.getQuote")} →
                </Link>
              </SpotlightCard>
            </StaggerItem>
          </div>
        </div>
      </section>

      {/* ── Bento Features (How It Works) — from blocks/bento-grids/bento-grid-with-skeletons.tsx ── */}
      <BentoFeatures />

      {/* ── Deep Features (Why Glatko?) — from schedule/features3.tsx pattern ── */}
      <DeepFeatures />

      <MobileShowcase
        title={t("landing.mobile.title")}
        subtitle={t("landing.mobile.subtitle")}
      />

      {/* ── Testimonials — from schedule/testimonials.tsx ── */}
      <Testimonials />

      <ImagesCTA
        title={t("landing.cta.title")}
        subtitle={t("landing.cta.subtitle")}
        buttonText={t("landing.cta.requestBtn")}
        buttonHref="/request-service"
        trustText={t("auth.brandPanel.bullet1")}
      />

      {/* ── FAQ — from schedule/faq.tsx ── */}
      <FAQ />

      {/* ── CTA — from blocks/cta/cta-with-dashed-grid-lines.tsx ── */}
      <DashedGridCTA />
    </>
  );
}
