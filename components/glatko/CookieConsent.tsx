"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "glatko-cookie-consent";

export function CookieConsent() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
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
