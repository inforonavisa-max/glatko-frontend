"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const GridLineHorizontal = ({
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
        "--height": "1px",
        "--width": "5px",
        "--fade-stop": "90%",
        "--offset": offset || "200px",
        "--color-dark": "rgba(255, 255, 255, 0.2)",
        maskComposite: "exclude",
      } as React.CSSProperties
    }
    className={cn(
      "absolute w-[calc(100%+var(--offset))] h-[var(--height)] left-[calc(var(--offset)/2*-1)]",
      "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
      "[background-size:var(--width)_var(--height)]",
      "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
      "[mask-composite:exclude]",
      "z-30",
      "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
      className
    )}
  />
);

const GridLineVertical = ({
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

export function AuthBrandPanel() {
  const t = useTranslations();

  const bullets = [
    t("auth.brandPanel.bullet1"),
    t("auth.brandPanel.bullet2"),
    t("auth.brandPanel.bullet3"),
  ];

  return (
    <div className="relative hidden w-full overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 dark:from-teal-800 dark:via-slate-900 dark:to-black md:flex md:items-center md:justify-center">
      <GridLineHorizontal className="top-0 left-1/2 -translate-x-1/2" offset="-10px" />
      <GridLineHorizontal className="bottom-0 top-auto left-1/2 -translate-x-1/2" offset="-10px" />
      <GridLineVertical className="left-10 top-1/2 -translate-y-1/2" offset="-10px" />
      <GridLineVertical className="right-10 left-auto top-1/2 -translate-y-1/2" offset="-10px" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />

      <div className="relative z-10 mx-auto max-w-sm px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 flex items-center gap-1">
            <span className="text-3xl font-bold tracking-tight text-white">
              Glatko
            </span>
            <span className="mt-1 h-2 w-2 rounded-full bg-teal-300" />
          </div>

          <h2 className="font-serif text-2xl leading-snug text-white/95">
            {t("auth.brandPanel.tagline")}
          </h2>

          <div className="mt-8 space-y-4">
            {bullets.map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-400/20">
                  <Check className="h-3.5 w-3.5 text-teal-300" />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <Quote className="mb-3 h-5 w-5 text-teal-300/60" />
            <p className="text-sm italic leading-relaxed text-white/70">
              &ldquo;{t("auth.brandPanel.quote")}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/20 text-xs font-semibold text-teal-300">
                {t("auth.brandPanel.quoteAuthor").charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">
                  {t("auth.brandPanel.quoteAuthor")}
                </p>
                <p className="text-xs text-white/50">
                  {t("auth.brandPanel.quoteCity")}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
