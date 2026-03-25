"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  label?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

export function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
  label,
}: StarRatingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const interactive = !readonly && !!onChange;

  const handleClick = useCallback(
    (starValue: number) => {
      if (interactive) onChange(starValue);
    },
    [interactive, onChange]
  );

  const displayValue = hoveredIndex !== null ? hoveredIndex : value;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
          {label}
        </span>
      )}
      <div
        className={cn("inline-flex items-center", size === "lg" ? "gap-2" : "gap-0.5")}
        role="group"
        aria-label={label ?? "Star rating"}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= displayValue;

          return (
            <motion.button
              key={starIndex}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => interactive && setHoveredIndex(starIndex)}
              onMouseLeave={() => interactive && setHoveredIndex(null)}
              whileHover={interactive ? { scale: 1.15 } : undefined}
              whileTap={interactive ? { scale: 0.9 } : undefined}
              animate={
                interactive && starIndex === value && hoveredIndex === null
                  ? { scale: [1, 1.15, 1] }
                  : undefined
              }
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={cn(
                "relative cursor-default outline-none transition-colors",
                "focus-visible:rounded focus-visible:ring-2 focus-visible:ring-teal-500/50",
                interactive && "cursor-pointer"
              )}
              aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  "transition-all duration-200",
                  filled
                    ? "fill-teal-500 text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]"
                    : "text-gray-300 dark:text-white/20"
                )}
              />
              {filled && (
                <Star
                  className={cn(
                    sizeMap[size],
                    "absolute inset-0 fill-teal-400 text-teal-400 opacity-50 blur-[3px]"
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
