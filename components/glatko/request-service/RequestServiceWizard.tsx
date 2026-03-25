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
  Check,
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
  const [direction, setDirection] = useState(1);
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

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
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
    setDirection(1);
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

  const dur = isNarrow ? 0.15 : 0.25;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-semibold text-gray-900 dark:text-white">
          {t("request.wizard.title")}
        </h1>
        <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
        <p className="mt-3 text-sm text-gray-500 dark:text-white/50">
          {t("request.wizard.subtitle")}
        </p>
      </div>

      {/* ── Step indicator — adapted from kit pricing.tsx card header pattern ── */}
      <div className="mb-8 flex items-center justify-center gap-0 px-2 sm:px-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isPast = i < step;
          const isCurrent = i === step;
          const isFuture = i > step;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : 0.95,
                  opacity: isFuture ? 0.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isPast && "bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-500/25",
                  isCurrent && "bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 ring-4 ring-teal-500/20",
                  isFuture && "border-2 border-gray-200 dark:border-white/[0.12]"
                )}
              >
                {isPast ? (
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                ) : (
                  <Icon className={cn("h-4 w-4", isCurrent ? "text-white" : "text-gray-400 dark:text-white/40")} />
                )}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06] sm:mx-2">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
                    initial={false}
                    animate={{ width: i < step ? "100%" : "0%" }}
                    transition={{ duration: isNarrow ? 0.25 : 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Glassmorphism container — adapted from kit pricing.tsx Card + D1 login card ── */}
      <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none md:p-10">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: dur, ease: [0.25, 0.4, 0.25, 1] }}
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

        {/* ── Navigation buttons — D1 login gradient button pattern ── */}
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all sm:w-auto",
              step === 0
                ? "hidden"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/[0.08] dark:text-white/60 dark:hover:bg-white/[0.04]"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("request.wizard.back")}
          </button>

          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={goNext}
              disabled={!canAdvance()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {t("request.wizard.next")}
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(20,184,166,0.25)" }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !phone}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("request.wizard.submit")
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
