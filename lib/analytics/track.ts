// lib/analytics/track.ts
//
// Glatko analytics event tracking — customer-side conversion funnel.
//
// All events go through window.gtag() wrapper (IArguments type) because
// GA4 tracker ignores raw dataLayer.push([Array]) pushes; only the
// arguments-object pushes produced by the gtag function are recognized.
// See G-ADS-2.1 hotfix (commit 850c0e9) for the discovery context.
//
// Safe to call from any client component; no-op on the server or if
// dataLayer / gtag are not available yet (e.g. before GTM init).

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

export type GlatkoEventName =
  | "customer_signup"
  | "customer_job_posted"
  | "customer_contact_clicked"
  | "customer_bid_accepted"
  | "customer_message_sent";

export type GlatkoContactChannel = "whatsapp" | "viber" | "phone" | "email";

export interface GlatkoEventParams {
  // Common
  currency?: string;
  value?: number;
  event_category?: string;
  // Funnel-specific (optional, vary by event)
  signup_method?: string;
  customer_user_id?: string;
  job_id?: string;
  job_category?: string;
  bid_id?: string;
  provider_id?: string;
  provider_slug?: string;
  contact_channel?: GlatkoContactChannel;
  thread_id?: string;
  conversation_id?: string;
}

/**
 * Track a customer-side conversion event.
 *
 * Safe to call from any client component — no-op if window/gtag/dataLayer
 * are unavailable. Defines the gtag() helper on first call if missing so
 * we work even if the inline beforeInteractive script hasn't run yet.
 *
 * @example
 *   trackEvent("customer_job_posted", { job_id: row.id, job_category: cat });
 */
export function trackEvent(
  eventName: GlatkoEventName,
  params: GlatkoEventParams = {},
): void {
  if (typeof window === "undefined") return;

  // Ensure dataLayer exists (in case event fires before GTM init).
  // Note: Window.dataLayer is declared globally by @next/third-parties.
  window.dataLayer = window.dataLayer || [];

  // Define local gtag wrapper if not present. Using `arguments` is what
  // makes the pushed entry IArguments-typed — required by GA4 (see file
  // header). Use a non-arrow function to capture arguments correctly.
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer = window.dataLayer || [];
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }

  // Default params merged with caller overrides.
  const fullParams: GlatkoEventParams = {
    currency: "EUR",
    value: 0,
    event_category: "customer_funnel",
    ...params,
  };

  window.gtag("event", eventName, fullParams);

  // Dev-mode debug log — production builds strip console.debug minification-safe.
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[trackEvent]", eventName, fullParams);
  }
}
