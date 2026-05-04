"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteAvatar, updateAvatar } from "@/lib/actions/profile";

const AVATAR_MAX = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AvatarUploadProps = {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
};

function initials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

export function AvatarUpload({ displayName, email, avatarUrl }: AvatarUploadProps) {
  const t = useTranslations("settings.profile.avatar");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();

  function clearPending() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPendingFile(null);
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error(t("uploadError"));
      return;
    }
    if (file.size > AVATAR_MAX) {
      toast.error(t("maxSize"));
      return;
    }

    clearPending();
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function confirmUpload() {
    if (!pendingFile) return;
    const file = pendingFile;
    const fd = new FormData();
    fd.append("avatar", file);
    startTransition(async () => {
      const res = await updateAvatar(fd);
      clearPending();
      if ("error" in res && res.error) {
        const err = res.error;
        if (err === "file_too_large") toast.error(t("maxSize"));
        else if (err === "invalid_type") toast.error(t("uploadError"));
        else if (err === "no_file") toast.error(t("uploadError"));
        else toast.error(t("uploadError"));
        return;
      }
      if ("success" in res && res.success) {
        toast.success(t("uploadSuccess"));
        router.refresh();
      }
    });
  }

  function onRemove() {
    startTransition(async () => {
      const res = await deleteAvatar();
      if ("error" in res && res.error) {
        toast.error(t("uploadError"));
        return;
      }
      clearPending();
      toast.success(t("removeSuccess"));
      router.refresh();
    });
  }

  const showUrl = preview ?? avatarUrl ?? null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-teal-500/20 dark:border-white/10">
        {showUrl ? (
          <Image
            src={showUrl}
            alt={t("title")}
            width={96}
            height={96}
            className="h-full w-full object-cover"
            unoptimized={showUrl.includes("supabase") || showUrl.startsWith("blob:")}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-teal-700 dark:text-teal-300">
            {initials(displayName, email)}
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFilePick}
        disabled={pending}
      />
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-white/45">{t("maxSize")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className={cn(
            "rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-teal-500/25 transition-opacity",
            "disabled:opacity-60"
          )}
        >
          {t("chooseFile")}
        </button>
        {pendingFile && (
          <>
            <button
              type="button"
              onClick={confirmUpload}
              disabled={pending}
              className={cn(
                "rounded-xl bg-gray-100 px-4 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.14]",
                "disabled:opacity-60"
              )}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("upload")}
            </button>
            <button
              type="button"
              onClick={() => clearPending()}
              disabled={pending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 dark:border-white/10 dark:text-white/70"
            >
              {t("discardPreview")}
            </button>
          </>
        )}
        {avatarUrl && !pendingFile && (
          <button
            type="button"
            onClick={onRemove}
            disabled={pending}
            className="rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 dark:border-red-500/30 dark:text-red-400"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("remove")}
          </button>
        )}
      </div>
    </div>
  );
}
