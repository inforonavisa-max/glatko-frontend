"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Calendar, DollarSign, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { submitBid } from "@/app/[locale]/pro/dashboard/requests/[id]/actions";
import { cn } from "@/lib/utils";

interface Props {
  request: {
    id: string;
    title: string;
    description: string | null;
    municipality: string | null;
    address: string | null;
    urgency: string;
    budget_min: number | null;
    budget_max: number | null;
    bid_count: number;
    max_bids: number;
    photos: string[];
    created_at: string;
    preferred_date_start: string | null;
    preferred_date_end: string | null;
    details: Record<string, unknown>;
    category?: { id: string; slug: string; name: Record<string, string>; icon: string | null };
    customer?: { full_name: string | null; avatar_url: string | null };
  };
  professionalId: string;
  alreadyBid: boolean;
  maxBidsReached: boolean;
  locale: string;
}

const PRICE_TYPES = ["fixed", "hourly", "estimate"] as const;

export function ProRequestDetail({ request, professionalId, alreadyBid, maxBidsReached, locale }: Props) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<typeof PRICE_TYPES[number]>("fixed");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const catName = request.category?.name?.[locale] ?? request.category?.name?.en ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("serviceRequestId", request.id);
      formData.set("professionalId", professionalId);
      formData.set("price", price);
      formData.set("priceType", priceType);
      formData.set("message", message);
      if (duration) formData.set("estimatedDurationHours", duration);
      if (availableDate) formData.set("availableDate", availableDate);

      const result = await submitBid(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to submit bid");
      }
    });
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-500/10"
        >
          <CheckCircle className="h-10 w-10 text-teal-500" />
        </motion.div>
        <h2 className="font-serif text-2xl text-gray-900 dark:text-white">{t("bidForm.success")}</h2>
        <p className="mt-3 max-w-md text-sm text-gray-500 dark:text-white/50">{t("bidForm.successDesc")}</p>
        <div className="mt-8 flex gap-3">
          <Link href={`/${locale}/pro/dashboard/requests`} className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.08]">
            {t("proRequests.title")}
          </Link>
          <Link href={`/${locale}/pro/dashboard/bids`} className="rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/25">
            {t("bids.title")}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Link href={`/${locale}/pro/dashboard/requests`} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-teal-500 dark:text-white/40 dark:hover:text-teal-400">
        <ArrowLeft className="h-4 w-4" />
        {t("proRequests.title")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs text-gray-400 dark:text-white/40">{catName}</p>
                <h1 className="font-serif text-2xl text-gray-900 dark:text-white">{request.title}</h1>
              </div>
              <span className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                request.urgency === "asap" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {t(`request.step3.urgency.${request.urgency === "asap" ? "urgent48h" : request.urgency === "this_week" ? "thisWeek" : request.urgency === "specific_date" ? "specificDate" : "flexible"}`)}
              </span>
            </div>

            {request.customer && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 dark:bg-white/[0.1] dark:text-white/60">
                  {request.customer.full_name?.charAt(0) ?? "?"}
                </div>
                {request.customer.full_name?.split(" ")[0] ?? "Customer"}
              </div>
            )}

            {request.description && <p className="mb-4 text-sm text-gray-600 dark:text-white/60">{request.description}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              {request.municipality && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                  <MapPin className="h-4 w-4 text-teal-400" />{request.municipality}{request.address ? ` — ${request.address}` : ""}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                <Clock className="h-4 w-4 text-teal-400" />{t(`request.step3.urgency.${request.urgency === "asap" ? "urgent48h" : request.urgency === "this_week" ? "thisWeek" : request.urgency === "specific_date" ? "specificDate" : "flexible"}`)}
              </div>
              {request.preferred_date_start && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                  <Calendar className="h-4 w-4 text-teal-400" />{request.preferred_date_start}{request.preferred_date_end ? ` — ${request.preferred_date_end}` : ""}
                </div>
              )}
              {(request.budget_min || request.budget_max) && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                  <DollarSign className="h-4 w-4 text-teal-400" />€{request.budget_min ?? "?"} - €{request.budget_max ?? "?"}
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {request.photos?.length > 0 && (
            <div className="rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider dark:text-white/40">
                <Camera className="h-4 w-4" />{t("dashboard.detail.photos")}
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {request.photos.map((url) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-xl">
                    <Image src={url} alt="" width={120} height={120} unoptimized className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Bid Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-gray-200/50 bg-white/70 p-6 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]">
            <h3 className="mb-1 font-serif text-xl text-gray-900 dark:text-white">{t("bidForm.title")}</h3>
            <p className="mb-6 text-xs text-gray-400 dark:text-white/30">{request.bid_count}/{request.max_bids} {t("proRequests.card.bidsReceived")}</p>

            {alreadyBid ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />{t("bidForm.alreadyBid")}
              </div>
            ) : maxBidsReached ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />{t("bidForm.maxBidsReached")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">{t("bidForm.price")}</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min={1}
                    step={0.01}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.1] dark:bg-white/[0.05] px-4 py-3 text-lg font-bold text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/20 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">{t("bidForm.priceType")}</label>
                  <div className="flex gap-2">
                    {PRICE_TYPES.map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPriceType(pt)}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                          priceType === pt
                            ? "border-teal-500 bg-teal-500/10 text-teal-400"
                            : "border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-white/[0.1] dark:text-white/40 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        {t(`bidForm.${pt}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">{t("bidForm.message")}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.1] dark:bg-white/[0.05] px-4 py-3 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/20 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none resize-none"
                    placeholder={t("bidForm.messagePlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">{t("bidForm.estimatedDuration")}</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min={0.5}
                      step={0.5}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.1] dark:bg-white/[0.05] px-4 py-3 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-white/20 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/60">{t("bidForm.availableDate")}</label>
                    <input
                      type="date"
                      value={availableDate}
                      onChange={(e) => setAvailableDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 py-3 text-sm font-medium text-white shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPending ? t("bidForm.submitting") : t("bidForm.submit")}
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
