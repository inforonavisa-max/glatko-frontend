"use client";

import { useTransition } from "react";
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
import { deactivateAccount } from "@/lib/actions/profile";
import { toast } from "sonner";

type DeactivateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeactivateModal({ open, onOpenChange }: DeactivateModalProps) {
  const t = useTranslations("settings.profile.account.deactivate");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const res = await deactivateAccount();
      if ("error" in res && res.error) {
        toast.error(t("error"));
        return;
      }
      window.location.href = `/${locale}`;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-gray-200/50 bg-white/95 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0b1f23]/95 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">{t("title")}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-white/55">
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={pending}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20"
            onClick={confirm}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("confirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
