"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { User, Bell, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/profile", labelKey: "profile", icon: User },
  { href: "/settings/notifications", labelKey: "notifications", icon: Bell },
  { href: "/settings/security", labelKey: "security", icon: Shield },
] as const;

type TabHref = (typeof TABS)[number]["href"];

export function SettingsNav() {
  const t = useTranslations("settings.tabs");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="border-b border-gray-200 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-950/70"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(({ href, labelKey, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href as TabHref}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-teal-500 text-teal-600 dark:border-teal-400 dark:text-teal-400"
                      : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-white/60 dark:hover:border-white/20 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
