import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FALLBACK = LucideIcons.Tag as LucideIcon;

export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return FALLBACK;
  const Component = (LucideIcons as Record<string, unknown>)[name];
  if (typeof Component === "function" || typeof Component === "object") {
    return Component as LucideIcon;
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[categoryIcon] Unknown lucide name: ${name}`);
  }
  return FALLBACK;
}
