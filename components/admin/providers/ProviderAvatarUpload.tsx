"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { adminUploadFile } from "@/lib/admin/uploadClient";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  targetUserId: string;
  url: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ProviderAvatarUpload({ targetUserId, url, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPT.includes(file.type)) {
      toast.error("JPG, PNG veya WebP olmalı");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB > 5 MB)`);
      return;
    }
    setPending(true);
    try {
      const publicUrl = await adminUploadFile({
        bucket: "avatars",
        targetUserId,
        file,
      });
      onChange(publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      {url ? (
        <Image
          src={url}
          alt="Avatar"
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-full border-2 border-gray-200/60 object-cover dark:border-white/[0.1]"
          unoptimized
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-teal-500/5 text-xs text-gray-400 dark:border-white/[0.1] dark:text-white/40">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Avatar"}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled || pending}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700",
            "hover:border-teal-500/30 hover:text-teal-700",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/70",
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {url ? "Değiştir" : "Yükle"}
        </button>
        {url && (
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            <Trash2 className="h-3 w-3" /> Kaldır
          </button>
        )}
        <p className="text-xs text-gray-500 dark:text-white/50">JPG/PNG/WebP, max 5 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
