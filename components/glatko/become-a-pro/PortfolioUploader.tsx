"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadProPortfolioImage,
  deleteProPortfolioImage,
  portfolioUrlToPath,
} from "@/lib/supabase/storage";

const MAX_PORTFOLIO_FILES = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;

type Props = {
  userId: string;
  /** Current uploaded URLs (parent state). */
  urls: string[];
  /** Replace the parent state URLs. */
  onChange: (urls: string[]) => void;
};

/**
 * G-PRO-1 Faz 3 — Portfolio uploader: drag-drop area, parallel multi-file
 * upload to pro-portfolio bucket, thumbnails grid with delete. Used in
 * StepPortfolio. Storage RLS gates owner; parent stores the public URL list.
 */
export function PortfolioUploader({ userId, urls, onChange }: Props) {
  const t = useTranslations("becomePro.portfolio");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [, startTransition] = useTransition();
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const remaining = MAX_PORTFOLIO_FILES - urls.length;

  function pickFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const allowed = list
      .filter((f) => {
        if (!ACCEPTED.includes(f.type as (typeof ACCEPTED)[number])) {
          toast.error(t("invalidType", { name: f.name }));
          return false;
        }
        if (f.size > MAX_FILE_BYTES) {
          toast.error(t("tooLarge", { name: f.name }));
          return false;
        }
        return true;
      })
      .slice(0, remaining);

    if (allowed.length === 0) return;
    if (list.length > remaining) {
      toast.error(t("maxFilesExceeded", { max: MAX_PORTFOLIO_FILES }));
    }

    setPendingCount((c) => c + allowed.length);
    const next: string[] = [...urls];
    let nextRevision = next;

    startTransition(async () => {
      for (const file of allowed) {
        try {
          const url = await uploadProPortfolioImage(file, userId);
          nextRevision = [...nextRevision, url];
          onChange(nextRevision);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          toast.error(t("uploadFailed", { name: file.name, error: msg }));
        } finally {
          setPendingCount((c) => Math.max(0, c - 1));
        }
      }
    });
  }

  async function removeImage(url: string) {
    setDeletingUrl(url);
    const path = portfolioUrlToPath(url);
    try {
      if (path) await deleteProPortfolioImage(path);
      onChange(urls.filter((u) => u !== url));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(t("deleteFailed", { error: msg }));
    } finally {
      setDeletingUrl(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (remaining <= 0) {
      toast.error(t("maxFilesExceeded", { max: MAX_PORTFOLIO_FILES }));
      return;
    }
    pickFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t("title")}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45">
            {t("hint", { max: MAX_PORTFOLIO_FILES })}
          </p>
        </div>
        <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium tabular-nums text-teal-700 dark:text-teal-300">
          {urls.length} / {MAX_PORTFOLIO_FILES}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (remaining > 0) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver
            ? "border-teal-500 bg-teal-500/5 dark:bg-teal-500/10"
            : "border-gray-200 bg-gray-50/40 hover:border-teal-500/40 hover:bg-teal-500/5 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-teal-400/40",
          remaining <= 0 && "cursor-not-allowed opacity-50",
        )}
        onClick={() => remaining > 0 && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-disabled={remaining <= 0}
      >
        <ImagePlus className="h-8 w-8 text-teal-500/60" aria-hidden />
        <p className="text-sm font-medium text-gray-700 dark:text-white/80">
          {t("dropHere")}
        </p>
        <p className="text-xs text-gray-500 dark:text-white/45">
          {t("supportedTypes")}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            pickFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(urls.length > 0 || pendingCount > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {urls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200/60 bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void removeImage(url);
                }}
                disabled={deletingUrl === url}
                className={cn(
                  "absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500/80 group-hover:opacity-100",
                  deletingUrl === url && "opacity-100",
                )}
                aria-label={t("remove")}
              >
                {deletingUrl === url ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          ))}
          {Array.from({ length: pendingCount }).map((_, i) => (
            <div
              key={`pending-${i}`}
              className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-teal-500/40 bg-teal-500/5"
            >
              <Loader2
                className="h-6 w-6 animate-spin text-teal-500"
                aria-hidden
              />
            </div>
          ))}
        </div>
      )}

      {urls.length === 0 && pendingCount === 0 && (
        <p className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3 text-center text-xs text-gray-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/45">
          {t("emptyState")}
        </p>
      )}
    </div>
  );
}

export { MAX_PORTFOLIO_FILES };
