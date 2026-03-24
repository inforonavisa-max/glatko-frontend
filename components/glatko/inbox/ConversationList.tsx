"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] dark:bg-white/[0.04] lg:bg-gray-100">
          <Mail className="h-7 w-7 text-white/30 dark:text-white/30 lg:text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/60 dark:text-white/60 lg:text-gray-600">
            {t("inbox.empty")}
          </p>
          <p className="mt-1 text-xs text-white/30 dark:text-white/30 lg:text-gray-400">
            {t("inbox.emptyDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
            transition={{ duration: 0.25, delay: idx * 0.05 }}
          >
            <Link
              href={`/${locale}/inbox/${conv.id}`}
              className={`group flex items-center gap-4 rounded-2xl border bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-teal-500/20 dark:border-white/[0.06] dark:bg-white/[0.03] lg:border-gray-200 lg:bg-white/80 ${
                isUnread
                  ? "border-l-2 border-l-teal-500 border-t-white/[0.06] border-r-white/[0.06] border-b-white/[0.06] dark:border-t-white/[0.06] dark:border-r-white/[0.06] dark:border-b-white/[0.06] lg:border-t-gray-200 lg:border-r-gray-200 lg:border-b-gray-200"
                  : "border-white/[0.06] dark:border-white/[0.06] lg:border-gray-200"
              }`}
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                {other?.avatar_url ? (
                  <Image
                    src={other.avatar_url}
                    alt={otherName}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-semibold text-teal-400">
                    {initial}
                  </span>
                )}
                {isUnread && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white/[0.03] bg-teal-500 dark:border-white/[0.03] lg:border-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`truncate text-sm ${
                      isUnread
                        ? "font-semibold text-white dark:text-white lg:text-gray-900"
                        : "font-medium text-white/80 dark:text-white/80 lg:text-gray-800"
                    }`}
                  >
                    {otherName}
                  </span>
                  <span className="shrink-0 text-[11px] text-white/30 dark:text-white/30 lg:text-gray-400">
                    {timeStr}
                  </span>
                </div>

                {conv.service_request?.title && (
                  <p className="truncate text-xs text-white/40 dark:text-white/40 lg:text-gray-500">
                    {conv.service_request.title}
                  </p>
                )}

                {conv.last_message && (
                  <p
                    className={`mt-0.5 truncate text-sm ${
                      isUnread
                        ? "text-white/70 dark:text-white/70 lg:text-gray-600"
                        : "text-white/50 dark:text-white/50 lg:text-gray-500"
                    }`}
                  >
                    {conv.last_message.sender_id === currentUserId && (
                      <span className="text-white/30 dark:text-white/30 lg:text-gray-400">
                        {t("inbox.you")}:{" "}
                      </span>
                    )}
                    {conv.last_message.content}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
