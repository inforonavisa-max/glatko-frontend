"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const logos = [
  { name: "Booking.com", text: "Booking.com" },
  { name: "TripAdvisor", text: "TripAdvisor" },
  { name: "Google", text: "Google" },
  { name: "Airbnb", text: "Airbnb" },
  { name: "Montenegro", text: "Visit Montenegro" },
  { name: "Porto", text: "Porto Montenegro" },
];

function MarqueeRow({ direction = "left" }: { direction?: "left" | "right" }) {
  const items = [...logos, ...logos, ...logos];

  return (
    <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className={cn(
          "flex shrink-0 gap-8 py-4",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
      >
        {items.map((logo, idx) => (
          <div
            key={`${logo.name}-${idx}`}
            className="flex h-12 items-center justify-center rounded-xl border border-gray-200/60 bg-white/80 px-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <span className="whitespace-nowrap text-sm font-medium text-gray-400 dark:text-white/30">
              {logo.text}
            </span>
          </div>
        ))}
      </div>
      <div
        className={cn(
          "flex shrink-0 gap-8 py-4",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
        aria-hidden
      >
        {items.map((logo, idx) => (
          <div
            key={`dup-${logo.name}-${idx}`}
            className="flex h-12 items-center justify-center rounded-xl border border-gray-200/60 bg-white/80 px-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <span className="whitespace-nowrap text-sm font-medium text-gray-400 dark:text-white/30">
              {logo.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  const t = useTranslations();

  return (
    <section className="overflow-hidden py-16">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-gray-400 dark:text-white/30">
          {t("landing.logoCloud.title")}
        </h2>
        <MarqueeRow direction="left" />
        <MarqueeRow direction="right" />
      </div>
    </section>
  );
}
