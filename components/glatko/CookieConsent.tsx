"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "glatko-cookie-consent";

// Push a Consent Mode v2 update to GTM dataLayer. Safe to call even if GTM
// hasn't loaded yet — dataLayer is a plain array and GTM will replay it on
// init. Mirrors the default block in app/layout.tsx (gtm-consent-default
// inline script) so every key set there is updated here.
// (Window.dataLayer is declared globally by @next/third-parties.)
function updateConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push([
    "consent",
    "update",
    {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
      functionality_storage: granted ? "granted" : "denied",
      personalization_storage: granted ? "granted" : "denied",
    },
  ]);

  // Meta Pixel consent (G-ADS-4a). No-op when fbq is not loaded
  // (skeleton mode — NEXT_PUBLIC_META_PIXEL_ID env empty → MetaPixel
  // component renders nothing, fbq stays undefined). Window.fbq global
  // is declared in lib/analytics/track.ts.
  if (typeof window.fbq === "function") {
    window.fbq("consent", granted ? "grant" : "revoke");
  }
}

export function CookieConsent() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Consent mount restore for returning visitors is handled SYNCHRONOUSLY
    // by the inline <Script id="gtm-consent-mount-restore" strategy=
    // "beforeInteractive"> in app/layout.tsx — before React hydration, before
    // GTM init. See G-ADS-2.1. This effect now only controls banner visibility
    // (any non-"accepted" value shows the banner).
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent !== "accepted") {
      setVisible(true);
    }
  }, []);

  function accept() {
    updateConsent(true);
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-gray-200/60 bg-white/90 px-6 py-4 shadow-xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-neutral-900/90 sm:flex-row sm:justify-between">
            <p className="text-center text-sm text-gray-600 dark:text-white/60 sm:text-left">
              {t("cookie.message")}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/cookies"
                className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                {t("cookie.learnMore")}
              </Link>
              <button
                onClick={accept}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40"
              >
                {t("cookie.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
