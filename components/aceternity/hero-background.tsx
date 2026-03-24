"use client";

/**
 * Adapted from Aceternity Pro:
 * - blocks/hero/hero-section-with-mesh-gradient (layered mesh + motion timing concepts)
 * - templates/startup-landing-page-template/components/hero.tsx (BackgroundGrids diagonal line pattern)
 * Colors adapted to Glatko teal (#14B8A6) / cyan.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { BackgroundGrids } from "@/components/aceternity/background-grids";

const easeMesh = [0.25, 0.1, 0.25, 1] as const;

type AceternityHeroBackgroundProps = {
  className?: string;
};

export function AceternityHeroBackground({ className }: AceternityHeroBackgroundProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#F8F6F0] dark:bg-[#080808]",
        className
      )}
    >
      {/* Diagonal grid — template `hero.tsx` BackgroundGrids + mesh blobs together */}
      <div className="absolute inset-0 z-[1] opacity-[0.85] dark:opacity-[0.9]" aria-hidden>
        <BackgroundGrids />
      </div>

      {/* Animated mesh blobs */}
      {!reduced && (
        <>
          <motion.div
            animate={{ x: [0, 90, 0], y: [0, -45, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: easeMesh }}
            className="absolute left-[15%] top-[18%] h-[580px] w-[580px] rounded-full bg-teal-400/12 blur-[118px] dark:bg-teal-500/22"
          />
          <motion.div
            animate={{ x: [0, -75, 0], y: [0, 55, 0], scale: [1.08, 0.94, 1.08] }}
            transition={{ duration: 26, repeat: Infinity, ease: easeMesh }}
            className="absolute bottom-[20%] right-[12%] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[100px] dark:bg-cyan-500/16"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            style={{ willChange: "transform" }}
            className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/8 blur-[88px] dark:bg-teal-400/12"
          />
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[25%] top-[40%] h-[320px] w-[320px] rounded-full bg-emerald-400/8 blur-[72px] dark:bg-emerald-500/10"
          />
        </>
      )}
      {reduced && (
        <div className="absolute left-[15%] top-[18%] h-[580px] w-[580px] rounded-full bg-teal-500/10 blur-[118px] dark:bg-teal-500/18" />
      )}

      {/* Fine grid overlay + radial vignette (Glatko G0.5) */}
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 z-[3] bg-[#F8F6F0] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,transparent_70%,#000_100%)] dark:bg-[#080808]" />
    </div>
  );
}
