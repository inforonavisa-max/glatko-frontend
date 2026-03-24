"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle, Calendar, Clock, Loader2 } from "lucide-react";
import { acceptBidAction } from "@/app/[locale]/dashboard/requests/[id]/actions";
import { cn } from "@/lib/utils";

interface BidData {
  id: string;
  price: number;
  price_type: string;
  message: string | null;
  status: string;
  created_at: string;
  estimated_duration_hours: number | null;
  available_date: string | null;
  professional?: {
    id: string;
    business_name: string | null;
    avg_rating: number;
    total_reviews: number;
    completed_jobs: number;
    is_verified: boolean;
  };
}

interface Props {
  bids: BidData[];
  requestId: string;
  requestStatus: string;
  locale: string;
}

export function BidComparison({ bids, requestId, requestStatus, locale }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleAccept(bidId: string) {
    if (!window.confirm(t("bidComparison.acceptConfirm") + "\n\n" + t("bidComparison.acceptConfirmDesc"))) return;
    setAcceptingId(bidId);
    startTransition(async () => {
      const result = await acceptBidAction(bidId, requestId);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.refresh(), 1500);
      }
    });
  }

  if (bids.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05]">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
        <p className="text-sm text-white/50">{t("bidComparison.noBids")}</p>
      </div>
    );
  }

  const canAccept = ["published", "bidding"].includes(requestStatus);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 text-center"
          >
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-teal-400" />
            <p className="text-sm font-medium text-teal-400">{t("bidComparison.assignedSuccess")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {bids.map((bid, i) => {
        const pro = bid.professional;
        const isAccepted = bid.status === "accepted";
        const isRejected = bid.status === "rejected";
        const fullStars = Math.round(pro?.avg_rating ?? 0);

        return (
          <motion.div
            key={bid.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className={cn(
              "rounded-2xl border p-5 transition-all",
              isAccepted
                ? "border-teal-500/40 bg-teal-500/[0.06]"
                : isRejected
                  ? "border-white/[0.04] bg-white/[0.01] opacity-50"
                  : "border-white/[0.08] bg-white/[0.03] backdrop-blur-sm hover:border-teal-500/20"
            )}
          >
            {isAccepted && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                <CheckCircle className="h-3 w-3" />
                {t("bidComparison.accepted")}
              </div>
            )}
            {isRejected && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                {t("bidComparison.rejected")}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] text-sm font-bold text-white/60">
                  {pro?.business_name?.charAt(0) ?? "P"}
                </div>
                <div>
                  <p className="font-medium text-white">{pro?.business_name ?? t("dashboard.detail.anonymous")}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star key={j} className={cn("h-3 w-3", j < fullStars ? "fill-teal-400 text-teal-400" : "text-white/10")} />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">
                      {(pro?.avg_rating ?? 0).toFixed(1)} ({pro?.total_reviews ?? 0} {t("bidComparison.rating")})
                    </span>
                    {pro?.is_verified && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-teal-400">
                        <CheckCircle className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-teal-400">€{bid.price}</p>
                <span className="text-xs text-white/40">{t(`bidForm.${bid.price_type}`)}</span>
              </div>
            </div>

            {bid.message && (
              <p className="mt-4 text-sm italic text-white/50">&ldquo;{bid.message}&rdquo;</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/40">
              {bid.available_date && (
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-teal-400" />{t("bidComparison.available")}: {bid.available_date}</span>
              )}
              {bid.estimated_duration_hours && (
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-teal-400" />{t("bidComparison.duration")}: ~{bid.estimated_duration_hours} {t("bidComparison.hours")}</span>
              )}
            </div>

            {!isRejected && canAccept && bid.status === "pending" && (
              <div className="mt-4 flex items-center gap-2">
                {pro && (
                  <Link href={`/${locale}/provider/${pro.id}`} className="rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/[0.08]">
                    {t("bidComparison.viewProfile")}
                  </Link>
                )}
                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAccept(bid.id)}
                  disabled={isPending}
                  className="ml-auto rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2 text-xs font-medium text-white shadow-lg shadow-teal-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isPending && acceptingId === bid.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                  {t("bidComparison.accept")}
                </motion.button>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
