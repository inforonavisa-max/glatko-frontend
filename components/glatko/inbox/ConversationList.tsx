"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  customer_id: string;
  professional_id: string;
  updated_at: string;
  service_request: {
    id: string;
    title: string;
    status: string;
    category: { name: string; icon: string } | null;
  } | null;
  customer: { id: string; full_name: string; avatar_url: string | null } | null;
  professional: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  last_message: {
    content: string;
    content_type: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
  } | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  locale: string;
}

function formatRelativeTime(
  iso: string,
  todayStr: string,
  yesterdayStr: string
): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (msgDay.getTime() === yesterday.getTime()) return yesterdayStr;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function ConversationList({
  conversations,
  currentUserId,
  locale,
}: ConversationListProps) {
  const t = useTranslations();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <MessageSquare className="h-14 w-14 text-teal-500/30" strokeWidth={1.5} />
        <div>
          <p className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
            {t("inbox.empty")}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/40">
            {t("inbox.emptyDesc")}
          </p>
        </div>
        <Link
          href="/request-service"
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-xl hover:shadow-teal-500/30"
        >
          {t("dashboard.requests.createFirst")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv, idx) => {
        const isCustomer = conv.customer_id === currentUserId;
        const other = isCustomer ? conv.professional : conv.customer;
        const otherName = other?.full_name ?? "User";
        const initial = otherName.charAt(0).toUpperCase();

        const isUnread =
          conv.last_message &&
          conv.last_message.sender_id !== currentUserId &&
          !conv.last_message.read_at;

        const timeStr = conv.last_message
          ? formatRelativeTime(
              conv.last_message.created_at,
              t("inbox.today"),
              t("inbox.yesterday")
            )
          : "";

        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
          >
            <Link
              href={`/${locale}/inbox/${conv.id}`}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/20 hover:shadow-md md:p-5",
                "border-gray-200/50 bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03]",
                isUnread && "border-l-2 border-l-teal-500 bg-teal-500/[0.02] dark:bg-teal-500/[0.04]"
              )}
            >
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200/60 bg-teal-500/10 dark:border-white/[0.1]">
                  {other?.avatar_url ? (
                    <Image
                      src={other.avatar_url}
                      alt={otherName}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                      {initial}
                    </span>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-sm",
                      isUnread
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-800 dark:text-white/80"
                    )}
                  >
                    {otherName}
                  </span>
                  <span className="shrink-0 text-[11px] text-gray-400 dark:text-white/30">
                    {timeStr}
                  </span>
                </div>

                {conv.service_request?.title && (
                  <p className="truncate text-xs text-gray-400 dark:text-white/30">
                    {conv.service_request.title}
                  </p>
                )}

                {conv.last_message && (
                  <p
                    className={cn(
                      "mt-0.5 truncate text-sm",
                      isUnread
                        ? "text-gray-700 dark:text-white/70"
                        : "text-gray-500 dark:text-white/40"
                    )}
                  >
                    {conv.last_message.sender_id === currentUserId && (
                      <span className="text-gray-400 dark:text-white/30">
                        {t("inbox.you")}:{" "}
                      </span>
                    )}
                    {conv.last_message.content}
                  </p>
                )}
              </div>

              {isUnread && (
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-medium text-white">
                  !
                </div>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
