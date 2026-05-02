"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MessageSquare, MapPin } from "lucide-react";

interface ThreadRow {
  id: string;
  request_id: string;
  professional_id: string;
  customer_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  customer_unread_count: number;
  pro_unread_count: number;
  status: string;
  glatko_service_requests: {
    id: string;
    title: string;
  } | null;
  glatko_professional_profiles: {
    id: string;
    business_name: string | null;
    location_city: string | null;
  } | null;
}

interface Props {
  threads: ThreadRow[];
  profileById: Record<
    string,
    { avatar_url: string | null; full_name: string | null }
  >;
  currentUserId: string;
  locale: string;
}

function relTime(iso: string | null, locale: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function ThreadList({
  threads,
  profileById,
  currentUserId,
  locale,
}: Props) {
  const t = useTranslations();

  if (threads.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 dark:text-neutral-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t("messaging.inboxEmptyTitle")}
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 max-w-md mx-auto">
            {t("messaging.inboxEmptyBody")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {t("messaging.inboxTitle")}
      </h1>
      <p className="text-gray-600 dark:text-neutral-400 mb-8">
        {t("messaging.inboxSubtitle")}
      </p>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden divide-y divide-gray-200 dark:divide-neutral-800">
        {threads.map((thread) => {
          const isCustomer = currentUserId === thread.customer_id;
          const counterpartId = isCustomer
            ? thread.professional_id
            : thread.customer_id;
          const counterpartProfile = counterpartId
            ? profileById[counterpartId]
            : undefined;
          const unread = isCustomer
            ? thread.customer_unread_count
            : thread.pro_unread_count;

          const counterpartName = isCustomer
            ? thread.glatko_professional_profiles?.business_name ??
              counterpartProfile?.full_name ??
              "—"
            : counterpartProfile?.full_name ?? "—";

          const initial = (counterpartName || "—")
            .substring(0, 2)
            .toUpperCase();

          const requestTitle =
            thread.glatko_service_requests?.title ?? "";
          const preview = thread.last_message_preview ?? "";
          const timeLabel = relTime(thread.last_message_at, locale);

          return (
            <Link
              key={thread.id}
              href={`/${locale}/messages/${thread.id}`}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              {counterpartProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={counterpartProfile.avatar_url}
                  alt={counterpartName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-neutral-700 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0">
                  {initial}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span
                    className={`truncate ${
                      unread > 0
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-semibold text-gray-900 dark:text-white"
                    }`}
                  >
                    {counterpartName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-neutral-500 shrink-0">
                    {timeLabel}
                  </span>
                </div>
                {requestTitle && (
                  <div className="text-xs text-gray-500 dark:text-neutral-500 truncate mb-1">
                    {t("messaging.threadFromRequest")}: {requestTitle}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm truncate ${
                      unread > 0
                        ? "font-medium text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-neutral-400"
                    }`}
                  >
                    {preview || (
                      <span className="italic text-gray-400 dark:text-neutral-600">
                        {t("messaging.noMessagesYet")}
                      </span>
                    )}
                  </p>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-600 text-white rounded-full text-xs font-semibold shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
                {isCustomer && thread.glatko_professional_profiles?.location_city && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-neutral-500 mt-1">
                    <MapPin className="h-3 w-3" />
                    {thread.glatko_professional_profiles.location_city}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
