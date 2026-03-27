"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
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
import { changePassword } from "@/lib/actions/profile";
import { toast } from "sonner";

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/10",
  "bg-white px-4 py-3 text-sm dark:bg-white/5",
  "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
);

type PasswordChangeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PasswordChangeModal({ open, onOpenChange }: PasswordChangeModalProps) {
  const t = useTranslations("settings.profile.account.changePassword");
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  function submit() {
    const fd = new FormData();
    fd.append("current_password", current);
    fd.append("new_password", next);
    fd.append("confirm_password", confirm);
    startTransition(async () => {
      const res = await changePassword(fd);
      if ("error" in res && res.error) {
        if (res.error === "invalid_current_password") {
          toast.error(t("wrongCurrent"));
        } else if (typeof res.error === "object") {
          toast.error(t("error"));
        } else {
          toast.error(t("error"));
        }
        return;
      }
      if ("success" in res && res.success) {
        toast.success(t("success"));
        reset();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-md border border-gray-200/50 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0b1f23]/95 sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-serif">{t("title")}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-white/55">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("currentPassword")}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className={inputCls}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("newPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-white/50">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 pt-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25"
            onClick={submit}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
