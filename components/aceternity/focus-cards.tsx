"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type FocusCard = {
  title: string;
  src: string;
  href?: string;
};

export const Card = React.memo(
  ({
    index,
    hovered,
    setHovered,
    children,
  }: {
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    children?: React.ReactNode;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
      )}
    >
      {children}
    </div>
  ),
);
Card.displayName = "FocusCard";

export function FocusCards<T extends FocusCard>({
  cards,
  renderCard,
}: {
  cards: T[];
  renderCard: (
    card: T,
    index: number,
    hovered: number | null,
    setHovered: React.Dispatch<React.SetStateAction<number | null>>,
  ) => React.ReactNode;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
      {cards.map((card, index) => renderCard(card, index, hovered, setHovered))}
    </div>
  );
}
