import type { EmailLocale } from "@/lib/email/templates/translations";

const FALLBACK_ORDER: readonly EmailLocale[] = [
  "en",
  "tr",
  "de",
  "ar",
  "it",
  "me",
  "ru",
  "sr",
  "uk",
];

/**
 * Picks a display string from a multi-locale map (e.g. category `name` JSON).
 */
export function pickLocalizedLabel(
  names: Record<string, string> | null | undefined,
  locale: string,
): string {
  const n = names ?? {};
  if (locale && typeof n[locale] === "string" && n[locale].trim()) {
    return n[locale].trim();
  }
  for (const k of FALLBACK_ORDER) {
    const v = n[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const first = Object.values(n).find(
    (v) => typeof v === "string" && String(v).trim(),
  );
  return typeof first === "string" ? first.trim() : "";
}
