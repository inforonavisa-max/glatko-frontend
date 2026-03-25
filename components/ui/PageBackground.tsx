"use client";

import { BackgroundGrids } from "@/components/aceternity/background-grids";

interface PageBackgroundProps {
  children: React.ReactNode;
  opacity?: number;
  meshBlobs?: boolean;
}

export function PageBackground({ children, opacity = 0.15, meshBlobs = true }: PageBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#F8F6F0] dark:bg-[#080808]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity }}
        aria-hidden
      >
        <BackgroundGrids />
      </div>
      {meshBlobs && (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden>
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/[0.04] blur-[80px] dark:bg-teal-500/[0.06]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.03] blur-[80px] dark:bg-cyan-500/[0.05]" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
