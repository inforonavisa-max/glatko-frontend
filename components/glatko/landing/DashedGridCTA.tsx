"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const GridLine = ({
  className,
  offset,
}: {
  className?: string;
  offset?: string;
}) => (
  <div
    style={
      {
        "--background": "#ffffff",
        "--color": "rgba(0, 0, 0, 0.2)",
        "--height": "5px",
        "--width": "1px",
        "--fade-stop": "90%",
        "--offset": offset || "150px",
        "--color-dark": "rgba(255, 255, 255, 0.2)",
        maskComposite: "exclude",
      } as React.CSSProperties
    }
    className={cn(
      "absolute h-[calc(100%+var(--offset))] w-[var(--width)] top-[calc(var(--offset)/2*-1)]",
      "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
      "[background-size:var(--width)_var(--height)]",
      "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
      "[mask-composite:exclude]",
      "z-30",
      "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
      className
    )}
  />
);

export function DashedGridCTA() {
  const t = useTranslations();
  const reduced = useReducedMotion();

  return (
    <section id="cta-pro" className="relative overflow-hidden py-20 md:py-28">
      <GridLine className="left-0" />
      <GridLine className="left-1/4" />
      <GridLine className="left-1/2" />
      <GridLine className="left-3/4" />
      <GridLine className="right-0 left-auto" />

      <div className="relative z-40 mx-auto max-w-4xl px-8 text-center">
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          style={reduced ? undefined : { willChange: "transform, opacity" }}
        >
          <h2 className="font-serif text-4xl font-bold text-gray-900 dark:text-white md:text-6xl">
            {t("landing.cta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500 dark:text-neutral-400">
            {t("landing.cta.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={reduced ? undefined : { willChange: "transform, opacity" }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/request-service">
            <motion.span
              whileHover={reduced ? undefined : { scale: 1.02, boxShadow: "0 0 30px rgba(20,184,166,0.3)" }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
              className="inline-block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all"
            >
              {t("landing.cta.requestBtn")}
            </motion.span>
          </Link>
          <Link href="/become-a-pro">
            <motion.span
              whileHover={reduced ? undefined : { scale: 1.02, backgroundColor: "rgba(20,184,166,0.08)" }}
              whileTap={reduced ? undefined : { scale: 0.98 }}
              className="inline-block rounded-xl border border-teal-500/30 px-8 py-4 text-sm font-semibold text-teal-700 backdrop-blur-sm transition-all hover:border-teal-500/50 dark:text-teal-300"
            >
              {t("landing.cta.proBtn")}
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
