"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  Layers,
  FileText,
  MapPin,
  Camera,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { submitServiceRequest } from "@/app/[locale]/request-service/actions";
import { cn } from "@/lib/utils";
import { StepCategory } from "./StepCategory";
import { StepDetails } from "./StepDetails";
import { StepLocation } from "./StepLocation";
import { StepPhotos } from "./StepPhotos";
import { RequestConfirmation } from "./RequestConfirmation";
import type { ServiceCategory } from "@/types/glatko";
import type { Locale } from "@/i18n/routing";

interface Props {
  userId: string;
  categories: ServiceCategory[];
}

const STEPS = [
  { icon: Layers, key: "category" },
  { icon: FileText, key: "details" },
  { icon: MapPin, key: "location" },
  { icon: Camera, key: "photos" },
] as const;

export function RequestServiceWizard({ userId, categories }: Props) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [step, setStep] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [selectedMainId, setSelectedMainId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [details, setDetails] = useState<Record<string, unknown>>({});

  const [municipality, setMunicipality] = useState("");
  const [address, setAddress] = useState("");
  const [marina, setMarina] = useState("");
  const [urgency, setUrgency] = useState("flexible");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [showBudget, setShowBudget] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    category: string;
    city: string;
    urgency: string;
    budget?: string;
  } | null>(null);

  const parents = categories.filter((c) => !c.parent_id);

  const selectedParent = parents.find((p) => p.id === selectedMainId);
  const parentSlug = selectedParent?.slug ?? "";

  const allChildren = categories.filter((c) => c.parent_id !== null);
  const selectedSub = allChildren.find((c) => c.id === selectedSubId);
  const selectedSubSlug = selectedSub?.slug ?? "";

  const isBoat = parentSlug === "boat-services";

  const catName = useCallback(
    (cat: ServiceCategory) => cat.name[locale] ?? cat.name.en ?? cat.slug,
    [locale]
  );

  const autoTitle =
    selectedSub && municipality
      ? `${catName(selectedSub)} - ${municipality}`
      : "";

  useEffect(() => {
    if (autoTitle && !title) setTitle(autoTitle);
  }, [autoTitle, title]);

  const canAdvance = (): boolean => {
    if (step === 0) return !!selectedSubId;
    if (step === 1) return true;
    if (step === 2) return !!municipality;
    return true;
  };

  const handleSubmit = () => {
    setError("");
    const fd = new FormData();
    fd.set("customerId", userId);
    fd.set("categoryId", selectedSubId);
    fd.set("title", title || autoTitle);
    fd.set("description", description);
    fd.set("details", JSON.stringify(details));
    fd.set("municipality", municipality);
    fd.set("address", address);
    if (showBudget && budgetMin) fd.set("budgetMin", budgetMin);
    if (showBudget && budgetMax) fd.set("budgetMax", budgetMax);
    fd.set("urgency", urgency);
    if (dateStart) fd.set("dateStart", dateStart);
    if (dateEnd) fd.set("dateEnd", dateEnd);
    fd.set("photos", JSON.stringify(photos));
    fd.set("phone", phone);
    fd.set("email", email);

    startTransition(async () => {
      const result = await submitServiceRequest(fd);
      if (result.success) {
        setSummaryData({
          category: selectedSub ? catName(selectedSub) : "",
          city: municipality,
          urgency,
          budget:
            showBudget && budgetMin
              ? `${budgetMin}${budgetMax ? ` - ${budgetMax}` : "+"} EUR`
              : undefined,
        });
        setSubmitted(true);
      } else {
        setError(result.error ?? t("request.error.generic"));
      }
    });
  };

  const resetWizard = () => {
    setStep(0);
    setSelectedMainId("");
    setSelectedSubId("");
    setDetails({});
    setMunicipality("");
    setAddress("");
    setMarina("");
    setUrgency("flexible");
    setDateStart("");
    setDateEnd("");
    setPhotos([]);
    setBudgetMin("");
    setBudgetMax("");
    setShowBudget(false);
    setPhone("");
    setEmail("");
    setTitle("");
    setDescription("");
    setError("");
    setSubmitted(false);
    setSummaryData(null);
  };

  if (submitted && summaryData) {
    return (
      <RequestConfirmation
        requestSummary={summaryData}
        onCreateAnother={resetWizard}
        t={t}
      />
    );
  }

  const stepTransition = { duration: isNarrow ? 0.15 : 0.25 };
  const progressFillDuration = isNarrow ? 0.25 : 0.4;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {t("request.wizard.title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-white/50">
          {t("request.wizard.subtitle")}
        </p>
      </div>

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
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-gray-200 text-gray-400 dark:border-white/10 dark:text-white/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
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

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
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
            <StepCategory
              selectedMainId={selectedMainId}
              setSelectedMainId={(id) => {
                setSelectedMainId(id);
                setSelectedSubId("");
              }}
              selectedSubId={selectedSubId}
              setSelectedSubId={setSelectedSubId}
              categories={categories}
              locale={locale}
              t={t}
            />
          )}
          {step === 1 && (
            <StepDetails
              details={details}
              setDetails={setDetails}
              selectedSubSlug={selectedSubSlug}
              t={t}
            />
          )}
          {step === 2 && (
            <StepLocation
              municipality={municipality}
              setMunicipality={setMunicipality}
              address={address}
              setAddress={setAddress}
              marina={marina}
              setMarina={setMarina}
              urgency={urgency}
              setUrgency={setUrgency}
              dateStart={dateStart}
              setDateStart={setDateStart}
              dateEnd={dateEnd}
              setDateEnd={setDateEnd}
              showMarina={isBoat}
              t={t}
            />
          )}
          {step === 3 && (
            <StepPhotos
              photos={photos}
              setPhotos={setPhotos}
              budgetMin={budgetMin}
              setBudgetMin={setBudgetMin}
              budgetMax={budgetMax}
              setBudgetMax={setBudgetMax}
              showBudget={showBudget}
              setShowBudget={setShowBudget}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              onSubmit={handleSubmit}
              isSubmitting={isPending}
              autoTitle={autoTitle}
              t={t}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {step < 3 && (
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all sm:w-auto",
              step === 0
                ? "hidden"
                : "text-gray-600 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("request.wizard.back")}
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-all sm:w-auto",
              "hover:bg-teal-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {t("request.wizard.next")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 sm:w-auto dark:text-white/60 dark:hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("request.wizard.back")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !phone}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-all sm:w-auto",
              "hover:bg-teal-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("request.wizard.submit")
            )}
          </button>
        </div>
      )}
    </div>
  );
}
