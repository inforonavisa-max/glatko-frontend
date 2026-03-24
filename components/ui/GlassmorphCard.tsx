"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { SpotlightRadialLayers } from "@/components/aceternity/spotlight-effect";
import { cn } from "@/lib/utils";

interface GlassmorphCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "section";
}

export function GlassmorphCard({
  children,
  className,
  hover = true,
  as: Tag = "div",
}: GlassmorphCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reduced = useReducedMotion();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const content = (
    <>
      {hover && (
        <SpotlightRadialLayers
          position={position}
          isHovered={isHovered}
          reduced={reduced}
        />
      )}
      <div className="relative z-10">{children}</div>
    </>
  );

  if (!hover || reduced) {
    return (
      <Tag
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors duration-300",
          "border-gray-200/80 bg-white/80 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none",
          className
        )}
      >
        {content}
      </Tag>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors duration-300",
        "border-gray-200/80 bg-white/80 shadow-sm hover:shadow-md hover:border-teal-200 dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none dark:hover:border-teal-500/30",
        className
      )}
    >
      {content}
    </motion.div>
  );
}
