"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/i18n/routing";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateLanguagePreference } from "@/lib/actions/profile";

const inputCls = cn(
  "block w-full rounded-xl border border-gray-200 dark:border-white/10",
  "bg-white px-4 py-3 text-sm dark:bg-white/5",
  "text-gray-900 dark:text-white",
  "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
);

type LanguageSelectorProps = {
  value: string;
};

export function LanguageSelector({ value }: LanguageSelectorProps) {
  const t = useTranslations("settings.profile.language");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const locale = next as Locale;
    if (!locales.includes(locale)) return;
    startTransition(async () => {
      const res = await updateLanguagePreference(locale);
      if ("error" in res && res.error) {
        toast.error(t("error"));
        return;
      }
      toast.success(t("changed"));
      // @ts-expect-error -- usePathname() returns a parametric pathname template; widen for locale switch
      router.replace(pathname, { locale });
      router.refresh();
    });
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-white/50">
        {t("title")}
      </label>
      <p className="mb-2 text-xs text-gray-500 dark:text-white/40">{t("description")}</p>
      <div className="relative">
        <select
          className={cn(inputCls, pending && "opacity-60")}
          value={value}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {localeNames[code]}
            </option>
          ))}
        </select>
        {pending && (
          <Loader2
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600 dark:text-teal-400"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
