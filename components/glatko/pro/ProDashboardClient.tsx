"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Gavel, Briefcase, CheckCircle, ArrowRight, Search } from "lucide-react";

interface Props {
  displayName: string;
  isVerified: boolean;
  rating: number;
  pendingBids: number;
  activeJobs: number;
  completedJobs: number;
  matchingRequestsCount: number;
  recentBidsCount: number;
  locale: string;
}

export function ProDashboardClient(props: Props) {
  const t = useTranslations();

  const stats = [
    { label: t("proDashboard.stats.pendingBids"), value: props.pendingBids, icon: Gavel, color: "text-amber-400" },
    { label: t("proDashboard.stats.activeJobs"), value: props.activeJobs, icon: Briefcase, color: "text-teal-400" },
    { label: t("proDashboard.stats.completedJobs"), value: props.completedJobs, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Banner */}
      <div className="mb-8 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-xl font-bold text-teal-400">
            {props.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-white md:text-3xl">
              {t("proDashboard.welcome")}, {props.displayName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {props.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-teal-400">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              )}
              {props.rating > 0 && (
                <span className="text-xs text-white/40">★ {props.rating.toFixed(1)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <Icon className={`mb-3 h-6 w-6 ${stat.color}`} />
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-white/40">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={`/${props.locale}/pro/dashboard/requests`}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-teal-500/30"
          >
            <div className="flex items-center gap-4">
              <Search className="h-6 w-6 text-teal-400" />
              <div>
                <p className="font-medium text-white">{t("proDashboard.nav.requests")}</p>
                <p className="text-xs text-white/40">{props.matchingRequestsCount} {t("proRequests.subtitle")}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/20 transition-colors group-hover:text-teal-400" />
          </motion.div>
        </Link>

        <Link href={`/${props.locale}/pro/dashboard/bids`}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-teal-500/30"
          >
            <div className="flex items-center gap-4">
              <Gavel className="h-6 w-6 text-amber-400" />
              <div>
                <p className="font-medium text-white">{t("proDashboard.nav.bids")}</p>
                <p className="text-xs text-white/40">{props.recentBidsCount} {t("bids.title").toLowerCase()}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/20 transition-colors group-hover:text-teal-400" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
