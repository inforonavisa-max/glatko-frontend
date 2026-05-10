"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminUploadFile } from "@/lib/admin/uploadClient";
import { cn } from "@/lib/utils";

const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  targetUserId: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

/**
 * G-ADMIN-PROVIDER-CREATE-01 portfolio uploader. Same UX shape as
 * components/glatko/become-a-pro/PortfolioUploader.tsx but uploads on
 * behalf of `targetUserId` via the admin signed-URL endpoint instead of
 * the owner-self storage helper.
 */
export function ProviderPhotoUpload({ targetUserId, urls, onChange, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [, startTransition] = useTransition();
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);

  const remaining = MAX_FILES - urls.length;

  function pickFiles(files: FileList | null) {
    if (!files || disabled) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const allowed = list
      .filter((f) => {
        if (!ACCEPT.includes(f.type)) {
          toast.error(`${f.name}: JPG/PNG/WebP olmalı`);
          return false;
        }
        if (f.size > MAX_BYTES) {
          toast.error(`${f.name}: 10 MB'dan büyük`);
          return false;
        }
        return true;
      })
      .slice(0, remaining);

    if (allowed.length === 0) return;
    if (list.length > remaining) {
      toast.error(`En fazla ${MAX_FILES} foto yükleyebilirsiniz`);
    }

    setPendingCount((c) => c + allowed.length);
    let next = [...urls];

    startTransition(async () => {
      for (const file of allowed) {
        try {
          const publicUrl = await adminUploadFile({
            bucket: "pro-portfolio",
            targetUserId,
            file,
          });
          next = [...next, publicUrl];
          onChange(next);
        } catch (err) {
          toast.error(
            `${file.name}: ${err instanceof Error ? err.message : "yükleme başarısız"}`,
          );
        } finally {
          setPendingCount((c) => Math.max(0, c - 1));
        }
      }
    });
  }

  function removeAt(url: string) {
    setRemovingUrl(url);
    onChange(urls.filter((u) => u !== url));
    setRemovingUrl(null);
    // Note: we don't actually delete the file from storage here. Orphan
    // files are cleaned up by a separate periodic sweep (out of scope).
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver
            ? "border-teal-500 bg-teal-500/5"
            : "border-gray-300 dark:border-white/[0.12]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <ImagePlus className="mx-auto mb-2 h-6 w-6 text-gray-400 dark:text-white/40" aria-hidden />
        <p className="text-sm text-gray-600 dark:text-white/60">
          Foto sürükle-bırak veya{" "}
          <button
            type="button"
            disabled={disabled || pendingCount > 0 || remaining <= 0}
            onClick={() => fileRef.current?.click()}
            className="font-medium text-teal-700 hover:underline disabled:opacity-50 dark:text-teal-300"
          >
            seç
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
          {urls.length} / {MAX_FILES} • JPG/PNG/WebP • max 10 MB
        </p>
        {pendingCount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-teal-600">
            <Loader2 className="h-3 w-3 animate-spin" /> {pendingCount} yükleniyor…
          </p>
        )}
      </div>

      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {urls.map((u) => (
            <div key={u} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.08]">
              <Image src={u} alt="" fill className="object-cover" unoptimized sizes="120px" />
              <button
                type="button"
                disabled={disabled || removingUrl === u}
                onClick={() => removeAt(u)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-30"
              >
                {removingUrl === u ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
