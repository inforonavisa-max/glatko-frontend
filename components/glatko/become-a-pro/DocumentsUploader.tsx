"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  uploadProDocument,
  deleteProDocument,
} from "@/lib/supabase/storage";

const MAX_DOCUMENTS = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"] as const;

const DOC_TYPES = [
  "license",
  "insurance",
  "tax_cert",
  "id_proof",
  "other",
] as const;
type DocType = (typeof DOC_TYPES)[number];

export interface ProDocument {
  url: string;
  path: string;
  type: DocType | string;
  name: string;
  uploaded_at: string;
}

type Props = {
  userId: string;
  documents: ProDocument[];
  onChange: (documents: ProDocument[]) => void;
};

/**
 * G-PRO-1 Faz 3 — Documents uploader: PDF/image upload to private
 * pro-documents bucket, with type tag (license/insurance/...). Returns
 * signed URL for preview (7 day) plus storage path. Parent stores both
 * so admins can re-resolve a fresh signed URL on demand.
 */
export function DocumentsUploader({ userId, documents, onChange }: Props) {
  const t = useTranslations("becomePro.documents");
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<DocType>("license");
  const [pendingCount, setPendingCount] = useState(0);
  const [, startTransition] = useTransition();
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const remaining = MAX_DOCUMENTS - documents.length;

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
      toast.error(t("maxFilesExceeded", { max: MAX_DOCUMENTS }));
    }

    setPendingCount((c) => c + allowed.length);
    let nextRevision = [...documents];
    const docType = pendingType;

    startTransition(async () => {
      for (const file of allowed) {
        try {
          const { path, signedUrl, name } = await uploadProDocument(
            file,
            userId,
            docType,
          );
          nextRevision = [
            ...nextRevision,
            {
              url: signedUrl,
              path,
              type: docType,
              name,
              uploaded_at: new Date().toISOString(),
            },
          ];
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

  async function removeDocument(path: string) {
    setDeletingPath(path);
    try {
      await deleteProDocument(path);
      onChange(documents.filter((d) => d.path !== path));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(t("deleteFailed", { error: msg }));
    } finally {
      setDeletingPath(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t("title")}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/45">
            {t("hint", { max: MAX_DOCUMENTS })}
          </p>
        </div>
        <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium tabular-nums text-teal-700 dark:text-teal-300">
          {documents.length} / {MAX_DOCUMENTS}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-gray-50/40 p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
        <label className="block text-xs font-medium text-gray-500 dark:text-white/50">
          {t("typeLabel")}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => setPendingType(dt)}
              disabled={remaining <= 0}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                pendingType === dt
                  ? "border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/30"
                  : "border-gray-200 bg-white text-gray-700 hover:border-teal-500/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70",
                remaining <= 0 && "cursor-not-allowed opacity-50",
              )}
            >
              {t(`types.${dt}`)}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={remaining <= 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all",
              "hover:shadow-xl hover:shadow-teal-500/30 active:scale-95",
              remaining <= 0 && "cursor-not-allowed opacity-50",
            )}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {t("uploadButton")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(e) => {
              pickFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {(documents.length > 0 || pendingCount > 0) && (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.path}
              className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                <FileText
                  className="h-5 w-5 text-teal-600 dark:text-teal-400"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-gray-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400"
                >
                  {doc.name}
                </a>
                <p className="text-xs text-gray-500 dark:text-white/45">
                  {t(`types.${doc.type}`, {
                    fallback: t("types.other"),
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void removeDocument(doc.path)}
                disabled={deletingPath === doc.path}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-white/40"
                aria-label={t("remove")}
              >
                {deletingPath === doc.path ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            </li>
          ))}
          {Array.from({ length: pendingCount }).map((_, i) => (
            <li
              key={`pending-${i}`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-teal-500/40 bg-teal-500/5 p-3"
            >
              <Loader2
                className="h-5 w-5 animate-spin text-teal-500"
                aria-hidden
              />
              <span className="text-sm text-teal-700 dark:text-teal-300">
                {t("uploading")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {documents.length === 0 && pendingCount === 0 && (
        <p className="rounded-xl border border-gray-100 bg-gray-50/40 px-4 py-3 text-center text-xs text-gray-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/45">
          {t("emptyState")}
        </p>
      )}
    </div>
  );
}

export { MAX_DOCUMENTS, DOC_TYPES };
