"use client";

import { BackgroundGrids } from "@/components/aceternity/background-grids";

interface PageBackgroundProps {
  children: React.ReactNode;
  opacity?: number;
}

export function PageBackground({ children, opacity = 0.15 }: PageBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#F8F6F0] dark:bg-[#080808]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ opacity }}
        aria-hidden
      >
        <BackgroundGrids />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
