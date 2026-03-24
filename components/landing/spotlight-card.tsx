"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { SpotlightRadialLayers } from "@/components/aceternity/spotlight-effect";
import { cn } from "@/lib/utils";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
        "border-gray-200 bg-white shadow-lg hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:shadow-none",
        "hover:border-teal-500/45 dark:hover:border-teal-500/35",
        className
      )}
    >
      <SpotlightRadialLayers
        position={position}
        isHovered={isHovered}
        reduced={reduced}
      />
      <div className="relative z-10 p-8">{children}</div>
    </motion.div>
  );
}
