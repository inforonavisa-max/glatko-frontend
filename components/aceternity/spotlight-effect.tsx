"use client";

/**
 * Spotlight radial layers — Aceternity card hover pattern (cursor-follow glow).
 * Source: Aceternity blocks / card spotlight implementations (adapted for teal).
 */

import { cn } from "@/lib/utils";

export type SpotlightPosition = { x: number; y: number };

type SpotlightRadialLayersProps = {
  position: SpotlightPosition;
  isHovered: boolean;
  reduced: boolean;
};

export function SpotlightRadialLayers({
  position,
  isHovered,
  reduced,
}: SpotlightRadialLayersProps) {
  const glowLight = `radial-gradient(650px circle at ${position.x}px ${position.y}px, rgba(20,184,166,0.12), transparent 42%)`;
  const glowDark = `radial-gradient(650px circle at ${position.x}px ${position.y}px, rgba(20,184,166,0.2), transparent 42%)`;

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -inset-px transition-opacity duration-300 ease-out dark:hidden",
          !reduced && "motion-safe:transition-opacity"
        )}
        style={{
          opacity: !reduced && isHovered ? 1 : 0,
          background: glowLight,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px hidden transition-opacity duration-300 ease-out dark:block"
        style={{
          opacity: !reduced && isHovered ? 1 : 0,
          background: glowDark,
        }}
        aria-hidden
      />
      {/* Aceternity-style subtle corner wash when hovered */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          "bg-gradient-to-br from-teal-500/[0.06] via-transparent to-cyan-500/[0.05]",
          "dark:from-teal-400/[0.08] dark:to-cyan-500/[0.06]",
          !reduced && isHovered && "opacity-100"
        )}
        aria-hidden
      />
    </>
  );
}
