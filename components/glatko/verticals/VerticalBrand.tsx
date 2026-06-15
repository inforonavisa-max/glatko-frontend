"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { VerticalKey } from "@/lib/verticals/config";

/**
 * Glatko Sağlık sub-brand lockup (MASTER_PLAN v1.3 §1.6, Getir model): the
 * "Glatko" wordmark + the localized vertical word, shown in section
 * headers/heroes and coming-soon pages once a visitor enters a vertical. The
 * switcher tabs keep the bare word; this lockup is where the named sub-brand
 * surfaces.
 *
 * Accent rule (§1.5): the vertical word takes the sub-brand accent, but only
 * via the brand-token group and only at the 700 shade — sky-600 (DEFAULT) is
 * below the 4.5:1 AA floor for text, brandHealth-700 clears it (5.93:1). The
 * "Glatko" half stays neutral so the wordmark never recolors. Client
 * component (useTranslations) but renders fine inside server pages.
 */

type BrandVertical = Exclude<VerticalKey, "services">;
type BrandSize = "sm" | "md" | "lg";

const WORD_ACCENT: Record<BrandVertical, string> = {
  health: "text-brandHealth-700 dark:text-brandHealth",
  career: "text-brandCareer-700 dark:text-brandCareer",
};

const SIZE: Record<BrandSize, string> = {
  sm: "text-lg",
  md: "text-2xl sm:text-3xl",
  lg: "text-4xl sm:text-5xl",
};

export function VerticalBrand({
  vertical,
  size = "md",
  className,
}: {
  vertical: BrandVertical;
  size?: BrandSize;
  className?: string;
}) {
  const t = useTranslations("verticals");
  const word = t(vertical);

  return (
    <span
      // Localized internal name ("Glatko Sağlık" / "Glatko Health") for AT.
      aria-label={`Glatko ${word}`}
      className={cn(
        "inline-flex items-baseline gap-1.5 font-serif font-light tracking-tight",
        SIZE[size],
        className,
      )}
    >
      <span className="text-gray-900 dark:text-white">Glatko</span>
      <span className={WORD_ACCENT[vertical]}>{word}</span>
    </span>
  );
}
