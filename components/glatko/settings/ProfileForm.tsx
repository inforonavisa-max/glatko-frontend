"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadProfileAvatar } from "@/lib/supabase/storage";
import { availableLanguages } from "@/components/LanguageSwitcher";
import {
  deleteAccountAction,
  updateProfileAction,
  type UserProfileRow,
} from "@/app/[locale]/settings/profile/actions";

const NOTIFICATION_STORAGE_KEY = "glatko_notification_prefs";

type NotificationPrefs = {
  newBids?: boolean;
  messages?: boolean;
  statusChanges?: boolean;
};

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08]",
  "bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 text-sm",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
);

const CITY_VALUES: { value: string; cityKey: string }[] = [
  { value: "Budva", cityKey: "budva" },
  { value: "Kotor", cityKey: "kotor" },
  { value: "Tivat", cityKey: "tivat" },
  { value: "Podgorica", cityKey: "podgorica" },
  { value: "Herceg Novi", cityKey: "hercegNovi" },
  { value: "Bar", cityKey: "bar" },
  { value: "Nikšić", cityKey: "niksic" },
  { value: "Cetinje", cityKey: "cetinje" },
  { value: "Ulcinj", cityKey: "ulcinj" },
  { value: "__other__", cityKey: "other" },
];

type ProfileFormProps = {
  initialProfile: UserProfileRow | null;
  email: string;
  userId: string;
};

function readNotifPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return { newBids: true, messages: true, statusChanges: true };
    const p = JSON.parse(raw) as Record<string, boolean>;
    return {
      newBids: p.newBids !== false,
      messages: p.messages !== false,
      statusChanges: p.statusChanges !== false,
    };
  } catch {
    return { newBids: true, messages: true, statusChanges: true };
  }
}

function writeNotifPrefs(p: NotificationPrefs) {
  try {
    const prev = JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || "{}");
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify({ ...prev, ...p })
    );
  } catch {
    /* ignore */
  }
}

function initials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function ProfileForm({ initialProfile, email, userId }: ProfileFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [phone, setPhone] = useState(initialProfile?.phone ?? "");
  const [city, setCity] = useState(() => {
    const c = initialProfile?.city;
    if (!c) return "";
    const known = CITY_VALUES.find((x) => x.value === c);
    if (known) return known.value;
    if (c === "__other__") return "__other__";
    return "__other__";
  });
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [preferredLang, setPreferredLang] = useState(
    initialProfile?.preferred_locale ?? "en"
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? "");

  const [notifNewBid, setNotifNewBid] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const p = readNotifPrefs();
    setNotifNewBid(p.newBids !== false);
    setNotifMessage(p.messages !== false);
    setNotifStatus(p.statusChanges !== false);
  }, []);

  const glassCard =
    "rounded-3xl border border-gray-200/50 bg-white/70 p-8 shadow-2xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] md:p-10";

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfileAvatar(file, userId);
      const res = await updateProfileAction({ avatar_url: url });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setAvatarUrl(url);
      toast.success(t("settings.profile.saved"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error(t("settings.profile.fullNameRequired"));
      return;
    }
    if (bio.length > 500) {
      toast.error(t("settings.profile.bioMax"));
      return;
    }
    setSaving(true);
    try {
      const cityVal = city === "__other__" ? "Other" : city || null;
      const res = await updateProfileAction({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        city: city ? cityVal : null,
        bio: bio.trim() || null,
        preferred_locale: preferredLang,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(t("settings.profile.saved"));
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await deleteAccountAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      window.location.href = "/";
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  function ToggleRow({
    enabled,
    onChange,
    label,
    disabled,
    badge,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
    disabled?: boolean;
    badge?: string;
  }) {
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <span className="text-sm text-gray-700 dark:text-white/80">{label}</span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-white/60">
              {badge}
            </span>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={disabled}
            onClick={() => !disabled && onChange(!enabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-2 dark:focus:ring-offset-[#0b1f23]",
              disabled && "cursor-not-allowed opacity-50",
              enabled ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                enabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6">
      <div className={glassCard}>
        <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">
          {t("settings.profile.title")}
        </h1>
        <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />

        <div className="mt-10 flex flex-col items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-teal-500/20 dark:border-white/10">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={t("settings.profile.avatar")}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized={avatarUrl.includes("supabase")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-teal-700 dark:text-teal-300">
                {initials(fullName, email)}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatar}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/5"
          >
            {uploading ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              t("settings.profile.changeAvatar")
            )}
          </button>
        </div>

        <div className="mt-10 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.fullName")} *
            </label>
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.email")}
            </label>
            <input className={cn(inputCls, "cursor-not-allowed opacity-60")} value={email} disabled readOnly />
            <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
              {t("settings.profile.emailHint")}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.phone")}
            </label>
            <input
              className={inputCls}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("settings.profile.phonePlaceholder")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.city")}
            </label>
            <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">{t("settings.profile.cityPlaceholder")}</option>
              {CITY_VALUES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.cityKey === "other"
                    ? t("settings.profile.cityOther")
                    : t(`cities.${c.cityKey}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.preferredLang")}
            </label>
            <select
              className={inputCls}
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("settings.profile.bio")}
            </label>
            <textarea
              className={cn(inputCls, "min-h-[120px] resize-y")}
              value={bio}
              maxLength={500}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("settings.profile.bioPlaceholder")}
            />
            <p className="mt-1 text-right text-xs text-gray-400 dark:text-white/35">
              {bio.length}/500
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200/60 pt-10 dark:border-white/[0.08]">
          <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
            {t("settings.profile.notifications")}
          </h2>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
          <div className="mt-4 divide-y divide-gray-100 dark:divide-white/[0.06]">
            <ToggleRow
              label={t("settings.profile.notifNewBid")}
              enabled={notifNewBid}
              onChange={(v) => {
                setNotifNewBid(v);
                writeNotifPrefs({ newBids: v, messages: notifMessage, statusChanges: notifStatus });
              }}
            />
            <ToggleRow
              label={t("settings.profile.notifMessage")}
              enabled={notifMessage}
              onChange={(v) => {
                setNotifMessage(v);
                writeNotifPrefs({ newBids: notifNewBid, messages: v, statusChanges: notifStatus });
              }}
            />
            <ToggleRow
              label={t("settings.profile.notifStatus")}
              enabled={notifStatus}
              onChange={(v) => {
                setNotifStatus(v);
                writeNotifPrefs({ newBids: notifNewBid, messages: notifMessage, statusChanges: v });
              }}
            />
            <ToggleRow
              label={t("settings.profile.notifPush")}
              enabled={false}
              onChange={() => {}}
              disabled
              badge={t("settings.profile.notifPushSoon")}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3.5 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-opacity disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("settings.profile.saving")}
            </>
          ) : (
            t("settings.profile.save")
          )}
        </button>
      </div>

      <div className={cn(glassCard, "mt-8")}>
        <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
          {t("settings.profile.account")}
        </h2>
        <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/reset-password"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 sm:flex-none"
          >
            {t("settings.profile.changePassword")}
          </Link>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-red-300 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 sm:flex-none"
          >
            {t("settings.profile.deleteAccount")}
          </button>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0b1f23]"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t("settings.profile.deleteConfirm")}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              {t("settings.profile.deleteWarning")}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-white/10 dark:text-white"
              >
                {t("settings.profile.deleteCancel")}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {deleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : t("settings.profile.deleteConfirmBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
