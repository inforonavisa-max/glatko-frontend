"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/70">
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
      } catch {
        // Upload failed silently; user can retry
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
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step4.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step4.subtitle")}
      </p>

      <div className="space-y-6">
        <div>
          <FieldLabel>{t("request.step4.photos")}</FieldLabel>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver
                ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
                : "border-gray-200 bg-gray-50 hover:border-teal-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-teal-500/30"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 dark:text-white/30" />
            )}
            <p className="text-sm text-gray-500 dark:text-white/50">
              {t("request.step4.dragOrClick")}
            </p>
          </div>
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
          <button
            type="button"
            onClick={() => {}}
            className="mt-2 text-xs text-gray-400 underline dark:text-white/40"
          >
            {t("request.step4.skipPhotos")}
          </button>

          {photos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {photos.map((url, i) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt=""
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(i);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <FieldLabel>{t("request.step4.budget")}</FieldLabel>
            <button
              type="button"
              onClick={() => setShowBudget(!showBudget)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                showBudget ? "bg-teal-500" : "bg-gray-200 dark:bg-white/10"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  showBudget ? "left-5" : "left-0.5"
                )}
              />
            </button>
          </div>
          {showBudget && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder={t("request.step4.budgetMin")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder={t("request.step4.budgetMax")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <FieldLabel>{t("request.step4.phone")} *</FieldLabel>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("request.step4.phonePlaceholder")}
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        <div>
          <FieldLabel>{t("request.step4.email")}</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("request.step4.emailPlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        <div>
          <FieldLabel>{t("request.step4.requestTitle")}</FieldLabel>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={autoTitle || t("request.step4.titlePlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
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
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
          />
        </div>
      </div>
    </div>
  );
}
