"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateAvatar } from "@/lib/actions/profile";

const AVATAR_MAX = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function initials(name: string | null, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return email[0]?.toUpperCase() ?? "?";
}

type Props = {
  displayName: string | null;
  email: string;
  initialUrl: string | null;
  onUrlChange: (url: string) => void;
};

export function ProWizardAvatarUpload({
  displayName,
  email,
  initialUrl,
  onUrlChange,
}: Props) {
  const t = useTranslations("pro.wizard");
  const tAvatar = useTranslations("settings.profile.avatar");
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
      toast.error(tAvatar("uploadError"));
      return;
    }
    if (file.size > AVATAR_MAX) {
      toast.error(tAvatar("maxSize"));
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
        if (err === "file_too_large") toast.error(tAvatar("maxSize"));
        else if (err === "invalid_type") toast.error(tAvatar("uploadError"));
        else if (err === "no_file") toast.error(tAvatar("uploadError"));
        else toast.error(tAvatar("uploadError"));
        return;
      }
      if ("success" in res && res.success && "url" in res && res.url) {
        toast.success(tAvatar("uploadSuccess"));
        onUrlChange(res.url);
        router.refresh();
      }
    });
  }

  const showUrl = preview ?? initialUrl ?? null;

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {t("avatarTitle")}
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-white/45">
        {t("avatarHint")}
      </p>

      <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white/20 bg-teal-500/20 dark:border-white/10">
          {showUrl ? (
            <Image
              src={showUrl}
              alt={t("avatarTitle")}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized={
                showUrl.includes("supabase") || showUrl.startsWith("blob:")
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-teal-700 dark:text-teal-300">
              {initials(displayName, email)}
            </div>
          )}
        </div>

        <div className="mt-4 flex w-full min-w-0 flex-1 flex-col items-center sm:mt-0 sm:items-stretch">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFilePick}
            disabled={pending}
          />
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              className={cn(
                "rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-teal-500/25 transition-opacity",
                "disabled:opacity-60"
              )}
            >
              {tAvatar("chooseFile")}
            </button>
            {pendingFile && (
              <>
                <p className="w-full text-center text-xs font-medium text-amber-700 dark:text-amber-400 sm:text-left">
                  ↓ {tAvatar("uploadInstruction")}
                </p>
                <button
                  type="button"
                  onClick={confirmUpload}
                  disabled={pending}
                  className={cn(
                    "rounded-xl bg-gray-100 px-4 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/[0.14]",
                    "disabled:opacity-60"
                  )}
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    tAvatar("upload")
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => clearPending()}
                  disabled={pending}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 dark:border-white/10 dark:text-white/70"
                >
                  {tAvatar("discardPreview")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
