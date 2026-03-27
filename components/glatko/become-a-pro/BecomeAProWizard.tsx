"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  User,
  Briefcase,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { submitProfessionalApplication } from "@/app/[locale]/become-a-pro/actions";
import { cn } from "@/lib/utils";
import { StepPersonalInfo } from "./StepPersonalInfo";
import { StepServiceAreas } from "./StepServiceAreas";
import { StepPortfolio } from "./StepPortfolio";
import type { ServiceCategory } from "@/types/glatko";
import type { Locale } from "@/i18n/routing";
import {
  AVATAR_REQUIRED,
  CATEGORY_REQUIRED,
} from "@/lib/validations/become-a-pro";

interface Props {
  categories: ServiceCategory[];
  userEmail: string;
  displayName: string | null;
  initialAvatarUrl: string | null;
}

const STEPS = [
  { icon: User, key: "step1" },
  { icon: Briefcase, key: "step2" },
  { icon: FolderOpen, key: "step3" },
] as const;

function mapSubmitError(
  err: string | undefined,
  t: ReturnType<typeof useTranslations>
): string | undefined {
  if (!err) return undefined;
  if (err === AVATAR_REQUIRED) return t("pro.wizard.avatarRequired");
  if (err === CATEGORY_REQUIRED) return t("pro.wizard.categoryRequired");
  return err;
}

export function BecomeAProWizard({
  categories,
  userEmail,
  displayName,
  initialAvatarUrl,
}: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [step, setStep] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl?.trim() ?? "");
  }, [initialAvatarUrl]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [hourlyMin, setHourlyMin] = useState("");
  const [hourlyMax, setHourlyMax] = useState("");

  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl?.trim() ?? "");

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const parents = categories.filter((c) => !c.parent_id);
  const childrenOf = useCallback(
    (parentId: string) => categories.filter((c) => c.parent_id === parentId),
    [categories]
  );

  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ success: boolean; error?: string }>({
    success: false,
  });

  const toggleLanguage = (lang: string) =>
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );

  const toggleCategory = (id: string) =>
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const hasAvatar = avatarUrl.trim().length > 0;

  const canAdvance =
    (step === 0 && hasAvatar) ||
    (step === 1 && selectedCategoryIds.length > 0);

  const stepTransition = { duration: isNarrow ? 0.15 : 0.25 };
  const progressFillDuration = isNarrow ? 0.25 : 0.4;

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex min-h-[40vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10">
          <CheckCircle className="h-8 w-8 text-teal-500" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
          {t("pro.wizard.success")}
        </h2>
        <p className="mt-2 max-w-md text-gray-500 dark:text-white/50">
          {t("pro.wizard.successDesc")}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none md:p-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {t("pro.wizard.title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-white/50">
          {t("pro.wizard.subtitle")}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-10 flex items-center gap-2 px-0.5 sm:gap-3 sm:px-1 md:px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i <= step;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-teal-500 bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-md shadow-teal-500/25"
                    : "border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-1 flex-1 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                    initial={false}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: progressFillDuration }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.error && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {mapSubmitError(state.error, t)}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={stepTransition}
        >
          {step === 0 && (
            <StepPersonalInfo
              businessName={businessName}
              setBusinessName={setBusinessName}
              bio={bio}
              setBio={setBio}
              phone={phone}
              setPhone={setPhone}
              city={city}
              setCity={setCity}
              languages={languages}
              toggleLanguage={toggleLanguage}
              experience={experience}
              setExperience={setExperience}
              hourlyMin={hourlyMin}
              setHourlyMin={setHourlyMin}
              hourlyMax={hourlyMax}
              setHourlyMax={setHourlyMax}
              userEmail={userEmail}
              displayName={displayName}
              avatarUrl={avatarUrl}
              onAvatarUrlChange={setAvatarUrl}
              t={t}
            />
          )}

          {step === 1 && (
            <StepServiceAreas
              parents={parents}
              childrenOf={childrenOf}
              allCategories={categories}
              selectedCategoryIds={selectedCategoryIds}
              toggleCategory={toggleCategory}
              primaryCategoryId={primaryCategoryId}
              setPrimaryCategoryId={setPrimaryCategoryId}
              expandedParent={expandedParent}
              setExpandedParent={setExpandedParent}
              locale={locale}
              t={t}
            />
          )}

          {step === 2 && <StepPortfolio t={t} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all sm:w-auto",
            step === 0
              ? "hidden"
              : "text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("pro.wizard.back")}
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all sm:w-auto",
              "hover:from-teal-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {t("pro.wizard.next")}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={
              isPending ||
              selectedCategoryIds.length === 0 ||
              !hasAvatar
            }
            onClick={() => {
              const fd = new FormData();
              fd.set("businessName", businessName);
              fd.set("bio", bio);
              fd.set("phone", phone);
              fd.set("city", city);
              fd.set("yearsExperience", experience);
              fd.set("hourlyRateMin", hourlyMin);
              fd.set("hourlyRateMax", hourlyMax);
              fd.set("avatar_url", avatarUrl.trim());
              languages.forEach((l) => fd.append("languages", l));
              selectedCategoryIds.forEach((id) => fd.append("categoryIds", id));
              fd.set("primaryCategoryId", primaryCategoryId);
              startTransition(async () => {
                const result = await submitProfessionalApplication(state, fd);
                setState(result);
              });
            }}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all sm:w-auto",
              "hover:from-teal-600 hover:to-teal-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("pro.wizard.submit")
            )}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
