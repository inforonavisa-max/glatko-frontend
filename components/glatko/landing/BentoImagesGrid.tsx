"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type GlatkoBentoImagesProps = {
  title: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  card4Title: string;
  card4Desc: string;
};

export function GlatkoBentoImages({
  title,
  card1Title,
  card1Desc,
  card2Title,
  card2Desc,
  card3Title,
  card3Desc,
  card4Title,
  card4Desc,
}: GlatkoBentoImagesProps) {
  return (
    <section className="pb-10 pt-4">
      <h2 className="mb-8 text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardSkeleton>
            <SkeletonPanel
              icon={<LayoutDashboard className="size-14 text-teal-600 dark:text-teal-400" />}
            />
          </CardSkeleton>
          <CardTitle>{card1Title}</CardTitle>
          <CardDescription>{card1Desc}</CardDescription>
        </Card>
        <Card className="md:col-span-1">
          <CardSkeleton>
            <SkeletonPanel
              icon={<Sparkles className="size-12 text-teal-600 dark:text-teal-400" />}
            />
          </CardSkeleton>
          <CardTitle>{card2Title}</CardTitle>
          <CardDescription>{card2Desc}</CardDescription>
        </Card>
        <Card className="md:col-span-1">
          <CardSkeleton>
            <SkeletonPanel
              icon={<ShieldCheck className="size-12 text-teal-600 dark:text-teal-400" />}
            />
          </CardSkeleton>
          <CardTitle>{card3Title}</CardTitle>
          <CardDescription>{card3Desc}</CardDescription>
        </Card>
        <Card className="md:col-span-2">
          <CardSkeleton>
            <SkeletonPanel
              icon={<Globe className="size-14 text-teal-600 dark:text-teal-400" />}
            />
          </CardSkeleton>
          <CardTitle>{card4Title}</CardTitle>
          <CardDescription>{card4Desc}</CardDescription>
        </Card>
      </div>
    </section>
  );
}

const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "rounded-xl border border-neutral-200 bg-white/90 p-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80",
      className,
    )}
  >
    {children}
  </div>
);

const CardTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: ReactNode }) => (
  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
    {children}
  </p>
);

const CardSkeleton = ({ children }: { children?: ReactNode }) => (
  <div className="relative mb-4 h-60 overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-teal-600/10 md:h-72 dark:from-teal-500/5 dark:via-cyan-500/[0.03] dark:to-teal-600/10">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />
    {children}
  </div>
);

function SkeletonPanel({ icon }: { icon: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden p-6">
      <motion.div
        initial={{ rotate: 0, scale: 1 }}
        whileHover={{ rotate: 2, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex items-center justify-center rounded-2xl bg-white/60 p-6 shadow-lg ring-1 ring-teal-500/10 dark:bg-black/40 dark:ring-teal-500/20"
      >
        {icon}
      </motion.div>
    </div>
  );
}
