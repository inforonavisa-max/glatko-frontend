"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function GlatkoHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [hash, setHash] = useState("");
  const [mounted, setMounted] = useState(false);

  const updateHash = useCallback(() => {
    if (typeof window === "undefined") return;
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      const max = 200;
      setHeaderOpacity(Math.min(0.8, (y / max) * 0.8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [updateHash]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/#categories", hash: "#categories", label: t("nav.services") },
    { href: "/#how-it-works", hash: "#how-it-works", label: t("nav.howItWorks") },
    { href: "/#cta-pro", hash: "#cta-pro", label: t("nav.becomeAPro") },
    { href: "/pro/dashboard", hash: "", label: t("nav.proDashboard"), isPro: true },
    { href: "/inbox", hash: "", label: t("nav.inbox"), isInbox: true },
  ];

  const isHome = pathname === "/";
  const isDark = mounted && resolvedTheme === "dark";
  const headerBg =
    !mounted || headerOpacity < 0.02
      ? "transparent"
      : isDark
        ? `rgba(8, 8, 8, ${headerOpacity})`
        : `rgba(255, 255, 255, ${headerOpacity})`;

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-[border-color] duration-300 ${
          scrolled
            ? "border-b border-black/5 backdrop-blur-xl dark:border-white/5"
            : "border-b border-transparent"
        }`}
        style={{ backgroundColor: headerBg }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Glatko
            </span>
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => {
              const active = isHome && hash === l.hash;
              if ("isInbox" in l) {
                return (
                  <Link key={l.href} href={l.href} className="nav-link relative flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                    <Mail className="h-3.5 w-3.5" />
                    {l.label}
                  </Link>
                );
              }
              if ("isPro" in l) {
                return (
                  <Link key={l.href} href={l.href} className="nav-link relative text-xs font-medium text-teal-600 dark:text-teal-400">
                    {l.label}
                  </Link>
                );
              }
              return (
                <a key={l.href} href={l.href} className="nav-link relative text-xs">
                  {l.label}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg border border-teal-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-600 transition-colors hover:bg-teal-500/10 dark:text-teal-400"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/request-service"
              className={cn(
                "rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50",
                !reduced && "animate-teal-pulse"
              )}
            >
              {t("nav.requestService")}
            </Link>
          </div>

          <button
            className="p-2 text-gray-700 md:hidden dark:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label={t("nav.menu")}
          >
            <Menu className="h-5 w-5" />
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
            className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-[#080808]"
          >
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-white/10">
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Glatko
                </span>
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X className="h-5 w-5 text-gray-700 dark:text-white" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-gray-100 py-3 text-lg font-medium text-gray-900 dark:border-white/5 dark:text-white"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/request-service"
                onClick={() => setMobileOpen(false)}
                className="border-b border-gray-100 py-3 text-lg font-medium text-teal-600 dark:border-white/5 dark:text-teal-400"
              >
                {t("nav.requestService")}
              </Link>
              <Link
                href="/pro/dashboard"
                onClick={() => setMobileOpen(false)}
                className="border-b border-gray-100 py-3 text-lg font-medium text-teal-600 dark:border-white/5 dark:text-teal-400"
              >
                {t("nav.proDashboard")}
              </Link>
              <Link
                href="/inbox"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 border-b border-gray-100 py-3 text-lg font-medium text-teal-600 dark:border-white/5 dark:text-teal-400"
              >
                <Mail className="h-5 w-5" />
                {t("nav.inbox")}
              </Link>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full rounded-xl border border-teal-500 py-3 text-center text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-teal-500/30",
                    !reduced && "animate-teal-pulse"
                  )}
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
