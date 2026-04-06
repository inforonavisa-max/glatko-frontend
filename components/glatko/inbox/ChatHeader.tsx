"use client";

import Image from "next/image";
import { ChevronLeft, CheckCircle } from "lucide-react";
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
    <header className="z-10 flex shrink-0 items-center gap-3 border-b border-gray-200/50 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-white/[0.06] dark:bg-[#0b1f23]/80 sm:px-6">
      <Link
        href={`/${locale}/inbox`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/[0.06]"
        aria-label={t("common.back")}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10 dark:bg-teal-500/20">
        {otherUser.avatar_url ? (
          <Image
            src={otherUser.avatar_url}
            alt={otherUser.full_name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
            {initial}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {otherUser.full_name}
          </span>
          {otherUser.is_verified && (
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-teal-500" />
          )}
        </div>
        {requestTitle && (
          <p className="truncate text-xs text-gray-400 dark:text-white/40">
            {requestId ? (
              <Link
                href={`/${locale}/dashboard/requests/${requestId}`}
                className="transition-colors hover:text-teal-500"
              >
                {requestTitle} &middot; {t("chat.viewRequest")}
              </Link>
            ) : (
              requestTitle
            )}
          </p>
        )}
      </div>

      <Link
        href={`/${locale}/provider/${otherUser.id}`}
        className="shrink-0 text-xs font-medium text-gray-400 transition-colors hover:text-teal-500 dark:text-white/40"
      >
        {t("chat.viewProfile")}
      </Link>
    </header>
  );
}
