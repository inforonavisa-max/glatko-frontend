"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ChatHeaderProps {
  otherUser: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    is_verified?: boolean;
  };
  requestTitle: string | null;
  requestId: string | null;
  locale: string;
}

export function ChatHeader({
  otherUser,
  requestTitle,
  requestId,
  locale,
}: ChatHeaderProps) {
  const t = useTranslations();
  const initial = otherUser.full_name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.03] sm:px-6 lg:border-gray-200 lg:bg-white/80">
      <Link
        href={`/${locale}/inbox`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white lg:text-gray-500 lg:hover:bg-gray-100 lg:hover:text-gray-900"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
        {otherUser.avatar_url ? (
          <img
            src={otherUser.avatar_url}
            alt={otherUser.full_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-teal-400">
            {initial}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-white dark:text-white lg:text-gray-900">
            {otherUser.full_name}
          </span>
          {otherUser.is_verified && (
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          )}
        </div>
        {requestTitle && (
          <p className="truncate text-xs text-white/40 dark:text-white/40 lg:text-gray-500">
            {requestId ? (
              <Link
                href={`/${locale}/dashboard/requests/${requestId}`}
                className="transition-colors hover:text-teal-400"
              >
                {requestTitle} · {t("chat.viewRequest")}
              </Link>
            ) : (
              requestTitle
            )}
          </p>
        )}
      </div>

      <Link
        href={`/${locale}/provider/${otherUser.id}`}
        className="shrink-0 text-xs text-white/40 transition-colors hover:text-teal-400 dark:text-white/40 lg:text-gray-400"
      >
        {t("chat.viewProfile")}
      </Link>
    </header>
  );
}
