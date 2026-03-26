"use client";

/**
 * Diagonal grid + static mesh glow (CSS radial gradients).
 * Avoids Framer-driven mesh blobs + large blur radii on the GPU.
 */

import { cn } from "@/lib/utils";
import { BackgroundGrids } from "@/components/aceternity/background-grids";

type AceternityHeroBackgroundProps = {
  className?: string;
};

export function AceternityHeroBackground({ className }: AceternityHeroBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-[#F8F6F0] dark:bg-[#0b1f23]",
        className
      )}
    >
      <div className="absolute inset-0 z-[1] opacity-[0.85] dark:opacity-[0.9]" aria-hidden>
        <BackgroundGrids />
      </div>

      {/* Static teal / cyan glow — radial gradients, no blur stack */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute left-[15%] top-[18%] h-[600px] w-[600px]"
          style={{
            background: "radial-gradient(circle, rgba(45,212,191,0.14) 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[12%] h-[520px] w-[520px]"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.11) 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[25%] top-[40%] h-[340px] w-[340px]"
          style={{
            background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 z-[3] bg-[#F8F6F0] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,transparent_70%,#000_100%)] dark:bg-[#0b1f23]" />
    </div>
  );
}
