"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Bell,
  DollarSign,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Star,
  ShieldCheck,
  ShieldX,
  CheckCheck,
} from "lucide-react";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import {
  getNotificationsAction,
  markReadAction,
  markAllReadAction,
} from "./actions";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

interface GlatkoNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  new_bid: DollarSign,
  bid_accepted: CheckCircle,
  bid_rejected: ShieldX,
  message: MessageSquare,
  status_change: RefreshCw,
  review: Star,
  verification_approved: ShieldCheck,
  verification_rejected: ShieldX,
  new_request_match: Bell,
};

type FilterType = "all" | "unread" | "bids" | "messages" | "status" | "reviews";

const filterToTypes: Record<FilterType, string[] | null> = {
  all: null,
  unread: null,
  bids: ["new_bid", "bid_accepted", "bid_rejected"],
  messages: ["message"],
  status: ["status_change", "verification_approved", "verification_rejected"],
  reviews: ["review"],
};

function getNotificationLink(n: GlatkoNotification): string {
  const d = n.data;
  switch (n.type) {
    case "new_bid":
    case "status_change":
      return d?.requestId ? `/dashboard/requests/${d.requestId}` : "/dashboard";
    case "bid_accepted":
      return "/pro/dashboard/bids";
    case "message":
      return d?.conversationId ? `/inbox/${d.conversationId}` : "/inbox";
    case "review":
      return d?.requestId ? `/review/${d.requestId}` : "/dashboard";
    case "verification_approved":
    case "verification_rejected":
      return "/pro/dashboard";
    default:
      return "/notifications";
  }
}

function getLocalizedTitle(type: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    new_bid: t("notifications.newBid.title"),
    bid_accepted: t("notifications.bidAccepted.title"),
    bid_rejected: t("notifications.bidRejected.title"),
    message: t("notifications.newMessage.title"),
    status_change: t("notifications.jobStarted.title"),
    review: t("notifications.reviewReceived.title"),
    verification_approved: t("notifications.verificationApproved.title"),
    verification_rejected: t("notifications.verificationRejected.title"),
  };
  return map[type] || type;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [notifications, setNotifications] = useState<GlatkoNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationsAction(100, filter === "unread");
      setNotifications(data as GlatkoNotification[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function handleMarkAllRead() {
    await markAllReadAction();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  }

  async function handleClick(n: GlatkoNotification) {
    if (!n.read_at) {
      await markReadAction(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item))
      );
    }
    router.push(getNotificationLink(n));
  }

  const filtered =
    filter === "all" || filter === "unread"
      ? notifications
      : notifications.filter((n) => filterToTypes[filter]?.includes(n.type));

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("notifications.all") },
    { key: "unread", label: t("notifications.unread") },
    { key: "bids", label: t("notifications.bids") },
    { key: "messages", label: t("notifications.messages") },
    { key: "status", label: t("notifications.statusChanges") },
    { key: "reviews", label: t("notifications.reviewsFilter") },
  ];

  return (
    <PageBackground>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <SectionTitle subtitle={t("notifications.emptyDesc")}>
            {t("notifications.title")}
          </SectionTitle>
          {notifications.some((n) => !n.read_at) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMarkAllRead}
              className="mt-1 flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/5 px-3 py-2 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-500/10 dark:text-teal-400"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("notifications.markAllRead")}
            </motion.button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                filter === f.key
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.1]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <GlassmorphCard hover={false} className="p-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10">
                  <Bell className="h-8 w-8 text-teal-500/50" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("notifications.empty")}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/40">
                  {t("notifications.emptyDesc")}
                </p>
              </div>
            </GlassmorphCard>
          )}

          {!loading &&
            filtered.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <GlassmorphCard className="cursor-pointer">
                    <button
                      onClick={() => handleClick(n)}
                      className={cn(
                        "flex w-full items-start gap-4 p-4 text-left",
                        !n.read_at && "bg-teal-50/30 dark:bg-teal-500/[0.03]"
                      )}
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/15">
                        <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getLocalizedTitle(n.type, t)}
                          </p>
                          {!n.read_at && (
                            <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
                          )}
                        </div>
                        {n.body && (
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-white/50">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-400 dark:text-white/30">
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </button>
                  </GlassmorphCard>
                </motion.div>
              );
            })}
        </div>
      </div>
    </PageBackground>
  );
}
