import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations();
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl text-gray-900 dark:text-white mb-8">
          {t("legal.contact")}
        </h1>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8">
          <p className="text-gray-500 dark:text-white/50">{t("legal.comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
