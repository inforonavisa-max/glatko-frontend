"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import type { NotificationPrefsRow } from "@/lib/actions/profile";
import { updateNotificationPrefs } from "@/lib/actions/profile";

type NotificationPrefsProps = {
  initial: NotificationPrefsRow | null;
};

export function NotificationPrefs({ initial }: NotificationPrefsProps) {
  const t = useTranslations("settings.profile.notifications");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const emailBid = initial?.email_new_bid !== false;
  const emailMsg = initial?.email_new_message !== false;
  const emailReview = initial?.email_new_review !== false;

  function persist(next: NotificationPrefsRow) {
    startTransition(async () => {
      const res = await updateNotificationPrefs(next);
      if ("error" in res && res.error) {
        toast.error(t("error"));
        return;
      }
      toast.success(t("saved"));
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
        {t("title")}
      </h2>
      <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
      <p className="mt-3 text-xs text-gray-500 dark:text-white/45">{t("email.title")}</p>
      <div className="mt-2 divide-y divide-gray-100 dark:divide-white/[0.06]">
        <Row
          label={t("email.newBid")}
          checked={emailBid}
          disabled={pending}
          onChange={(v) =>
            persist({
              email_new_bid: v,
              email_new_message: emailMsg,
              email_new_review: emailReview,
            })
          }
        />
        <Row
          label={t("email.newMessage")}
          checked={emailMsg}
          disabled={pending}
          onChange={(v) =>
            persist({
              email_new_bid: emailBid,
              email_new_message: v,
              email_new_review: emailReview,
            })
          }
        />
        <Row
          label={t("email.newReview")}
          checked={emailReview}
          disabled={pending}
          onChange={(v) =>
            persist({
              email_new_bid: emailBid,
              email_new_message: emailMsg,
              email_new_review: v,
            })
          }
        />
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-sm text-gray-700 dark:text-white/80">{t("push.title")}</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-white/60">
              {t("push.soon")}
            </span>
            <Switch checked={false} onCheckedChange={() => {}} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-gray-700 dark:text-white/80">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
