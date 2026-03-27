"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteAccount } from "@/lib/actions/profile";
import { toast } from "sonner";

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/10",
  "bg-white px-4 py-3 text-sm dark:bg-white/5",
  "text-gray-900 dark:text-white",
  "focus:border-red-500 focus:ring-2 focus:ring-red-500/40 focus:outline-none"
);

type DeleteAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const t = useTranslations("settings.profile.account.delete");
  const locale = useLocale();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const res = await deleteAccount(text.trim());
      if ("error" in res && res.error) {
        if (res.error === "invalid_confirmation") {
          toast.error(t("invalidConfirm"));
        } else {
          toast.error(t("error"));
        }
        return;
      }
      window.location.href = `/${locale}`;
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setText("");
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md border border-red-200/60 bg-white/95 backdrop-blur-sm dark:border-red-500/25 dark:bg-[#0b1f23]/95 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-red-600 dark:text-red-400">{t("title")}</DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-white/65">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{t("warning")}</p>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/50">
            {t("confirmText")}
          </label>
          <input
            className={inputCls}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("confirmPlaceholder")}
            autoComplete="off"
          />
        </div>
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
            onClick={confirm}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
