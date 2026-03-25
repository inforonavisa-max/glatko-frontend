"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Bell,
  Mail,
  DollarSign,
  RefreshCw,
  MessageSquare,
  Star,
  CheckCircle,
} from "lucide-react";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  newBids: boolean;
  bidUpdates: boolean;
  messages: boolean;
  statusChanges: boolean;
  reviews: boolean;
}

const STORAGE_KEY = "glatko_notification_prefs";

const defaults: NotificationPreferences = {
  inApp: true,
  email: true,
  newBids: true,
  bidUpdates: true,
  messages: true,
  statusChanges: true,
  reviews: true,
};

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-2 dark:focus:ring-offset-[#080808]",
        enabled ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const t = useTranslations();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaults);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function update(key: keyof NotificationPreferences, val: boolean) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: val };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  if (!mounted) return null;

  const perTypeItems: {
    key: keyof NotificationPreferences;
    label: string;
    icon: typeof Bell;
  }[] = [
    { key: "newBids", label: t("settings.notifications.newBids"), icon: DollarSign },
    { key: "bidUpdates", label: t("settings.notifications.bidUpdates"), icon: CheckCircle },
    { key: "messages", label: t("settings.notifications.messages"), icon: MessageSquare },
    { key: "statusChanges", label: t("settings.notifications.statusChanges"), icon: RefreshCw },
    { key: "reviews", label: t("settings.notifications.reviews"), icon: Star },
  ];

  return (
    <PageBackground>
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <SectionTitle>{t("settings.notifications.title")}</SectionTitle>

        <div className="mt-8 space-y-6">
          <GlassmorphCard hover={false} className="p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10">
                    <Bell className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("settings.notifications.inApp")}
                    </p>
                  </div>
                </div>
                <Toggle enabled={prefs.inApp} onChange={(v) => update("inApp", v)} />
              </div>

              <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10">
                    <Mail className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("settings.notifications.email")}
                    </p>
                  </div>
                </div>
                <Toggle enabled={prefs.email} onChange={(v) => update("email", v)} />
              </div>
            </div>
          </GlassmorphCard>

          <GlassmorphCard hover={false} className="p-6">
            <div className="space-y-4">
              {perTypeItems.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {i > 0 && <div className="mb-4 h-px bg-gray-100 dark:bg-white/[0.06]" />}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10">
                        <item.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                        {item.label}
                      </p>
                    </div>
                    <Toggle enabled={prefs[item.key]} onChange={(v) => update(item.key, v)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphCard>
        </div>
      </div>
    </PageBackground>
  );
}
