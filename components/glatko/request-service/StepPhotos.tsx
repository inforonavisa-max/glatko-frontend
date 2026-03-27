"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CloudUpload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { resizeImage } from "@/lib/utils/imageResize";
import { uploadRequestPhoto } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

interface Props {
  photos: string[];
  setPhotos: (v: string[]) => void;
  budgetMin: string;
  setBudgetMin: (v: string) => void;
  budgetMax: string;
  setBudgetMax: (v: string) => void;
  showBudget: boolean;
  setShowBudget: (v: boolean) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  autoTitle: string;
  t: (key: string) => string;
}

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/[0.08]",
  "bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 text-sm",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
);

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
      {children}
    </label>
  );
}

export function StepPhotos({
  photos,
  setPhotos,
  budgetMin,
  setBudgetMin,
  budgetMax,
  setBudgetMax,
  showBudget,
  setShowBudget,
  phone,
  setPhone,
  email,
  setEmail,
  title,
  setTitle,
  description,
  setDescription,
  autoTitle,
  t,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const tempId = useRef(`tmp-${Date.now()}`);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (fileArray.length === 0) return;

      setUploading(true);
      try {
        const urls: string[] = [];
        for (const file of fileArray) {
          const resized = await resizeImage(file);
          const url = await uploadRequestPhoto(resized, tempId.current);
          urls.push(url);
        }
        setPhotos([...photos, ...urls]);
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error ? err.message : t("request.error.generic")
        );
      } finally {
        setUploading(false);
      }
    },
    [photos, setPhotos]
  );

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step4.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step4.subtitle")}
      </p>

      <div className="space-y-6">
        {/* ── Drag-drop zone — adapted from kit CTA dashed grid pattern ── */}
        <div>
          <FieldLabel>{t("request.step4.photos")}</FieldLabel>
          <motion.div
            whileHover={{ scale: dragOver ? 1 : 1.005 }}
            animate={dragOver ? { scale: 1.005 } : { scale: 1 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
              dragOver
                ? "border-teal-500 bg-teal-500/[0.04] dark:bg-teal-500/[0.08]"
                : "border-gray-300/60 bg-white/30 hover:border-teal-500/40 hover:bg-teal-500/[0.02] dark:border-white/[0.12] dark:bg-white/[0.02] dark:hover:border-teal-500/30"
            )}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15">
                <CloudUpload className="h-7 w-7 text-teal-600 dark:text-teal-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-white/70">
                {t("request.step4.dragOrClick")}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-white/30">PNG, JPG — max 5 MB</p>
            </div>
          </motion.div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {photos.map((url, i) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200/60 dark:border-white/[0.08]">
                  <Image src={url} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Budget toggle ── */}
        <div>
          <div className="flex items-center gap-3">
            <FieldLabel>{t("request.step4.budget")}</FieldLabel>
            <button
              type="button"
              onClick={() => setShowBudget(!showBudget)}
              className={cn("relative h-7 w-12 rounded-full transition-colors", showBudget ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10")}
            >
              <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform", showBudget ? "left-5" : "left-0.5")} />
            </button>
          </div>
          {showBudget && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder={t("request.step4.budgetMin")} className={inputCls} />
              </div>
              <div>
                <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder={t("request.step4.budgetMax")} className={inputCls} />
              </div>
            </div>
          )}
        </div>

        {/* ── Contact fields — D1 login input pattern ── */}
        <div>
          <FieldLabel>{t("request.step4.phone")} *</FieldLabel>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("request.step4.phonePlaceholder")} required className={inputCls} />
        </div>

        <div>
          <FieldLabel>{t("request.step4.email")}</FieldLabel>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("request.step4.emailPlaceholder")} className={inputCls} />
        </div>

        <div>
          <FieldLabel>{t("request.step4.requestTitle")}</FieldLabel>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle || t("request.step4.titlePlaceholder")} className={inputCls} />
          {autoTitle && !title && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-white/40">
              <ImageIcon className="h-3 w-3" />
              {t("request.step4.autoTitle")}: {autoTitle}
            </p>
          )}
        </div>

        <div>
          <FieldLabel>{t("request.step4.description")}</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("request.step4.descriptionPlaceholder")}
            rows={3}
            className={cn(inputCls, "resize-none")}
          />
        </div>
      </div>
    </div>
  );
}
