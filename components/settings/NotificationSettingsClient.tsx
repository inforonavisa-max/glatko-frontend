"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import { cn } from "@/lib/utils";
import type { NotificationEmailPrefKey } from "@/lib/notifications/prefs";
import type { NormalizedNotificationPrefs } from "@/lib/notifications/prefs";
import { updateNotificationPreference } from "@/lib/actions/profile";

type RowDef = {
  prefKey: NotificationEmailPrefKey;
  labelKey:
    | "customer.newBid"
    | "customer.bidUpdates"
    | "customer.messages"
    | "customer.statusChange"
    | "customer.reviews"
    | "pro.newMatch"
    | "pro.bidUpdates"
    | "pro.messages"
    | "pro.reviews"
    | "pro.verification";
};

const CUSTOMER_ROWS: RowDef[] = [
  { prefKey: "email_new_bid", labelKey: "customer.newBid" },
  { prefKey: "email_customer_bid_events", labelKey: "customer.bidUpdates" },
  { prefKey: "email_new_message", labelKey: "customer.messages" },
  { prefKey: "email_status_change", labelKey: "customer.statusChange" },
  { prefKey: "email_new_review", labelKey: "customer.reviews" },
];

const PRO_ROWS: RowDef[] = [
  { prefKey: "email_new_request_match", labelKey: "pro.newMatch" },
  { prefKey: "email_pro_bid_outcome", labelKey: "pro.bidUpdates" },
  { prefKey: "email_new_message", labelKey: "pro.messages" },
  { prefKey: "email_new_review", labelKey: "pro.reviews" },
  { prefKey: "email_verification", labelKey: "pro.verification" },
];

export function NotificationSettingsClient({
  initialPrefs,
  isPro,
}: {
  initialPrefs: NormalizedNotificationPrefs;
  isPro: boolean;
}) {
  const t = useTranslations("settings.notifications");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [prefs, setPrefs] = useState<NormalizedNotificationPrefs>(initialPrefs);

  useEffect(() => {
    setPrefs(initialPrefs);
  }, [initialPrefs]);

  const persist = useCallback(
    (key: NotificationEmailPrefKey, enabled: boolean) => {
      let previousEnabled = false;
      setPrefs((p) => {
        previousEnabled = p[key];
        return { ...p, [key]: enabled };
      });

      startTransition(async () => {
        const res = await updateNotificationPreference("email", key, enabled);
        if ("error" in res) {
          setPrefs((p) => ({ ...p, [key]: previousEnabled }));
          toast.error(t("saveError"));
          return;
        }
        router.refresh();
      });
    },
    [router, t],
  );

  return (
    <PageBackground>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <SectionTitle>{t("title")}</SectionTitle>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/45">
          {t("subtitle")}
        </p>

        <div className="mt-8 space-y-8">
          <PrefsTable
            title={t("customerSection")}
            rows={CUSTOMER_ROWS}
            prefs={prefs}
            onToggle={persist}
            disabled={pending}
            t={t}
          />

          {isPro ? (
            <PrefsTable
              title={t("proSection")}
              rows={PRO_ROWS}
              prefs={prefs}
              onToggle={persist}
              disabled={pending}
              t={t}
            />
          ) : null}
        </div>
      </div>
    </PageBackground>
  );
}

function PrefsTable({
  title,
  rows,
  prefs,
  onToggle,
  disabled,
  t,
}: {
  title: string;
  rows: RowDef[];
  prefs: NormalizedNotificationPrefs;
  onToggle: (key: NotificationEmailPrefKey, v: boolean) => void;
  disabled: boolean;
  t: (key: string, values?: Record<string, string>) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-full"
    >
      <div className="max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <GlassmorphCard
          hover={false}
          className="min-w-[min(100%,18rem)] overflow-hidden p-0 sm:min-w-0"
        >
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <h2 className="font-serif text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-0 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-white/40 sm:px-5">
          <div className="pl-1">{t("columnNotification")}</div>
          <div className="flex w-14 justify-center sm:w-16">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {t("columnEmail")}
            </span>
          </div>
          <div className="flex w-14 justify-center sm:w-16">
            <span className="flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              {t("columnPush")}
            </span>
          </div>
        </div>

        {rows.map((row) => (
          <div
            key={`${row.prefKey}-${row.labelKey}`}
            className={cn(
              "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-t border-gray-100 px-4 py-3.5 sm:px-5 dark:border-white/[0.06]",
            )}
          >
            <p className="pr-2 text-sm font-medium text-gray-800 dark:text-white/85">
              {t(row.labelKey)}
            </p>
            <div className="flex w-14 justify-center sm:w-16">
              <Switch
                checked={prefs[row.prefKey]}
                onCheckedChange={(v) => onToggle(row.prefKey, v)}
                disabled={disabled}
                aria-label={t("emailToggleAria", {
                  label: t(row.labelKey),
                })}
              />
            </div>
            <div className="flex w-14 justify-center sm:w-16">
              <span
                className="inline-flex cursor-help opacity-40"
                title={t("pushComingSoon")}
              >
                <Switch
                  checked={false}
                  disabled
                  onCheckedChange={() => {}}
                  className="pointer-events-none"
                  aria-label={t("pushComingSoon")}
                />
              </span>
            </div>
          </div>
        ))}
        </GlassmorphCard>
      </div>
    </motion.div>
  );
}
