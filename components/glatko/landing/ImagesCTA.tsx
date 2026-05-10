"use client";

import { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PLACEHOLDER_INITIALS = ["G", "P", "M", "A", "K", "T"];

type ImagesCTAProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  trustText: string;
};

export function ImagesCTA({
  title,
  subtitle,
  buttonText,
  buttonHref,
  trustText,
}: ImagesCTAProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 py-20 md:flex-row md:px-8">
      <div className="flex flex-col">
        <motion.h2 className="mx-auto max-w-xl text-center text-xl font-bold text-gray-900 md:mx-0 md:text-left md:text-3xl dark:text-white">
          {title}
        </motion.h2>
        <p className="mx-auto mt-8 max-w-md text-center text-sm text-neutral-600 md:mx-0 md:text-left md:text-base dark:text-neutral-400">
          {subtitle}
        </p>
        <PlaceholderAvatars trustText={trustText} />
      </div>
      {/* @ts-expect-error -- buttonHref is string-typed prop; runtime URL is a valid pathname */}
      <Link href={buttonHref}>
        <motion.span
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group mt-10 inline-flex cursor-pointer items-center space-x-2 rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-4 py-2 text-base text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.25)_inset] md:mt-0"
        >
          <span>{buttonText}</span>
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-white transition-transform duration-200 group-hover:translate-x-1" />
        </motion.span>
      </Link>
    </div>
  );
}

function PlaceholderAvatars({ trustText }: { trustText: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const halfWidth = target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className="mt-10 flex flex-col items-center md:items-start">
      <div className="flex flex-row items-center justify-center">
        {PLACEHOLDER_INITIALS.map((letter, i) => (
          <div
            className="group relative -mr-4"
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence mode="popLayout">
              {hoveredIndex === i && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 10,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  style={{
                    translateX,
                    rotate: i % 2 === 0 ? "2deg" : "-2deg",
                    whiteSpace: "nowrap",
                  }}
                  className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-xs shadow-xl dark:bg-neutral-800"
                >
                  <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <div className="absolute left-10 -bottom-px z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                  <div className="relative z-30 text-base font-bold text-white">
                    Pro {i + 1}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              role="presentation"
              onMouseMove={handleMouseMove}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-md transition duration-500 group-hover:z-30 group-hover:scale-105 dark:border-black",
              )}
            >
              {letter}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-neutral-500 md:text-left dark:text-neutral-400">
        {trustText}
      </p>
    </div>
  );
}
