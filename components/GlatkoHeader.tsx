"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Mail, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/glatko/notifications/NotificationDropdown";
import { createClient } from "@/supabase/browser";

interface GlatkoHeaderProps {
  userId?: string | null;
}

export function GlatkoHeader({ userId }: GlatkoHeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const reduced = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHeaderOpacity(Math.min(0.8, (y / 200) * 0.8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setAvatarOpen(false); }, [pathname]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const headerBg =
    !mounted || headerOpacity < 0.02
      ? "transparent"
      : isDark
        ? `rgba(8, 8, 8, ${headerOpacity})`
        : `rgba(255, 255, 255, ${headerOpacity})`;

  const guestLinks = [
    { href: "/services", label: t("nav.services") },
    { href: "/providers", label: t("search.title") },
    { href: "/#how-it-works", label: t("nav.howItWorks"), isAnchor: true },
    { href: "/become-a-pro", label: t("nav.becomeAPro") },
  ];

  const userLinks = [
    { href: "/services", label: t("nav.services") },
    { href: "/providers", label: t("search.title") },
    { href: "/dashboard/requests", label: t("nav.requests") },
    { href: "/inbox", label: t("nav.inbox"), hasIcon: true },
  ];

  const navLinks = userId ? userLinks : guestLinks;

  const dropdownItems = [
    { href: "/pro/dashboard", label: t("nav.proDashboard") },
    { href: "/dashboard/requests", label: t("nav.requests") },
    { href: "/inbox", label: t("nav.inbox") },
    { href: "/settings/notifications", label: t("nav.settings") },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-[border-color] duration-300",
          scrolled
            ? "border-b border-black/5 backdrop-blur-xl dark:border-white/5"
            : "border-b border-transparent"
        )}
        style={{ backgroundColor: headerBg }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Glatko
            </span>
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              if ("isAnchor" in l) {
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-md px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    {l.label}
                  </a>
                );
              }
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-4 py-2 text-xs font-medium transition-colors",
                    "hasIcon" in l
                      ? "flex items-center gap-1.5 text-teal-600 dark:text-teal-400"
                      : isActive
                        ? "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  )}
                >
                  {"hasIcon" in l && <Mail className="h-3.5 w-3.5" />}
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {userId && <NotificationBell userId={userId} />}
            <LanguageSwitcher />
            <ThemeToggle />

            {userId ? (
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-gray-100 dark:border-neutral-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("auth.logout")}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/request-service"
                  className={cn(
                    "rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40",
                    !reduced && "animate-teal-pulse"
                  )}
                >
                  {t("nav.requestService")}
                </Link>
              </>
            )}
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

      {/* Close avatar dropdown on outside click */}
      {avatarOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
      )}

      {/* Mobile menu */}
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
                <span className="text-xl font-bold text-gray-900 dark:text-white">Glatko</span>
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2" aria-label={t("common.close")}>
                <X className="h-5 w-5 text-gray-700 dark:text-white" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "border-b border-gray-100 py-3 text-lg font-medium dark:border-white/5",
                    "hasIcon" in l
                      ? "flex items-center gap-2 text-teal-600 dark:text-teal-400"
                      : "text-gray-900 dark:text-white"
                  )}
                >
                  {"hasIcon" in l && <Mail className="h-5 w-5" />}
                  {l.label}
                </Link>
              ))}

              {userId && (
                <>
                  <Link
                    href="/pro/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-gray-100 py-3 text-lg font-medium text-teal-600 dark:border-white/5 dark:text-teal-400"
                  >
                    {t("nav.proDashboard")}
                  </Link>
                  <Link
                    href="/settings/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 border-b border-gray-100 py-3 text-lg font-medium text-gray-900 dark:border-white/5 dark:text-white"
                  >
                    <Settings className="h-5 w-5" />
                    {t("nav.settings")}
                  </Link>
                </>
              )}

              <div className="mt-6 flex flex-col gap-3">
                {userId ? (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("auth.logout")}
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full rounded-xl border border-teal-500 py-3 text-center text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      href="/request-service"
                      onClick={() => setMobileOpen(false)}
                      className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-teal-500/30"
                    >
                      {t("nav.requestService")}
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-auto flex items-center gap-4 pt-6">
                {userId && <NotificationBell userId={userId} />}
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
