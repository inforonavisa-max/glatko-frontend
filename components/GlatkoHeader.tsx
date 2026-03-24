"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export function GlatkoHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/#categories", label: t("nav.services") },
    { href: "/#how-it-works", label: t("nav.howItWorks") },
    { href: "/#cta-pro", label: t("nav.becomeAPro") },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#080808]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Glatko
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="nav-link text-xs">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-teal-500/50 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
            >
              {t("nav.requestService")}
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-700 dark:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label={t("nav.menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-[#080808] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-white/10">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Glatko</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-xl border border-teal-500 text-teal-600 dark:text-teal-400"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="w-full py-3 text-center text-sm font-semibold uppercase tracking-wider rounded-xl bg-teal-500 text-white"
                >
                  {t("nav.register")}
                </Link>
              </div>
              <div className="mt-auto flex items-center gap-4 pt-6">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
