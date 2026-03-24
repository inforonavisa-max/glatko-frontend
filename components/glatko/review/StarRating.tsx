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
  sm: "h-7 w-7",
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
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/50">
          {label}
        </span>
      )}
      <div
        className="inline-flex items-center gap-0.5"
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
              whileHover={interactive ? { scale: 1.1 } : undefined}
              whileTap={interactive ? { scale: 0.9 } : undefined}
              animate={
                interactive && starIndex === value && hoveredIndex === null
                  ? { scale: [1, 1.15, 1] }
                  : undefined
              }
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={cn(
                "relative cursor-default outline-none transition-colors",
                "focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:rounded",
                interactive && "cursor-pointer"
              )}
              aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  "transition-all duration-200",
                  filled
                    ? "fill-current bg-gradient-to-r text-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
              {filled && (
                <Star
                  className={cn(
                    sizeMap[size],
                    "absolute inset-0 fill-current text-teal-500 opacity-60 blur-[2px]"
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
