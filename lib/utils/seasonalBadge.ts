export type SeasonalCategory = {
  seasonal: string | null;
  active_months: number[] | null;
};

export type SeasonalStatus = "active" | "off";

export type SeasonalBadge = {
  status: SeasonalStatus;
  emoji: string;
};

/**
 * Year-round categories return null. Seasonal categories return the current
 * status with a matching emoji; the caller is expected to look up the
 * translated label via the next-intl dictionary key `seasonal.active` or
 * `seasonal.off`.
 */
export function getSeasonalBadge(
  category: SeasonalCategory,
  now: Date = new Date(),
): SeasonalBadge | null {
  if (!category.seasonal || category.seasonal === "year-round") return null;
  const months = category.active_months;
  if (!months || months.length === 0) return null;
  const currentMonth = now.getMonth() + 1;
  const isActive = months.includes(currentMonth);
  return {
    status: isActive ? "active" : "off",
    emoji: isActive ? "🟢" : "❄️",
  };
}
