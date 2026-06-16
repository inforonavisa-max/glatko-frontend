/**
 * Glatko Sağlık — single config source for the health sub-brand (MASTER_PLAN
 * v1.3 §1.6). Getir model: named, modular, separable later WITHOUT a rewrite.
 * Everything host/path/token-shaped for the vertical is declared here so a
 * future carve-out (saglik.glatko.app or its own domain) is a one-file change
 * (see docs/health/EXTRACTION.md). DO NOT scatter "/health" literals or sky
 * hex values across components — import from here.
 */

/**
 * next-intl route keys (see i18n/routing.ts `pathnames`). Keys are the
 * locale-neutral identifiers; the per-locale slug (/saglik, /zdravlje, …)
 * is resolved by next-intl from the pathnames map. `Link`/`getPathname`
 * accept these keys directly.
 */
export const HEALTH_ROUTES = {
  home: "/health",
  comingSoon: "/health/coming-soon",
  /**
   * Target of the health header's "are you a doctor? join" link. Today this is
   * the public provider waitlist (the coming-soon page). When the pro
   * application ships, flip THIS one constant to its route key
   * (e.g. "/health-pro/apply") — the header derives the href from here only and
   * never hardcodes "/saglik/yakinda".
   */
  providerJoin: "/health/coming-soon",
} as const;

/**
 * Future host for the carved-out sub-brand. `null` today = served under the
 * main app at glatko.app/<locale>/saglik. When the carve-out happens this
 * becomes "saglik.glatko.app" and the URL builder below switches origins —
 * nothing else in the codebase needs to change.
 */
export const HEALTH_HOST: string | null = null;

/** Internal, non-localized brand name (logs, admin, analytics dimensions). */
export const HEALTH_INTERNAL_NAME = "Glatko Sağlık";

/** Tailwind accent token group for this vertical (see tailwind.config.ts). */
export const HEALTH_ACCENT_TOKEN = "brandHealth" as const;
