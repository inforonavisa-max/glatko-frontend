"use client";

import { useState } from "react";
import { Check, CheckCheck, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const KNOWN_LANG_CODES = [
  "en",
  "tr",
  "de",
  "ru",
  "sr",
  "me",
  "it",
  "ar",
  "uk",
] as const;

type KnownLang = (typeof KNOWN_LANG_CODES)[number];

function normalizeLangCode(code: string | null | undefined): KnownLang {
  const c = (code ?? "en").trim().toLowerCase().slice(0, 8);
  return (KNOWN_LANG_CODES as readonly string[]).includes(c)
    ? (c as KnownLang)
    : "en";
}

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    content: string;
    content_type: string;
    created_at: string;
    read_at: string | null;
    original_locale?: string | null;
    translated_content?: string | null;
    translated_locale?: string | null;
  };
  isOwn: boolean;
  showDate: boolean;
  dateLabel: string | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function MessageBubble({
  message,
  isOwn,
  showDate,
  dateLabel,
}: MessageBubbleProps) {
  const t = useTranslations();
  const [showOriginalIncoming, setShowOriginalIncoming] = useState(false);

  const hasIncomingTranslation =
    !isOwn &&
    message.content_type === "text" &&
    Boolean(
      message.translated_content?.trim() &&
        message.translated_locale &&
        message.translated_content !== message.content,
    );

  const sourceLangCode = normalizeLangCode(message.original_locale);
  const sourceLangName = t(`language.${sourceLangCode}`);

  const bodyText =
    isOwn || !hasIncomingTranslation
      ? message.content
      : showOriginalIncoming
        ? message.content
        : (message.translated_content ?? message.content);

  return (
    <>
      {showDate && dateLabel && (
        <div className="flex items-center gap-3 py-6">
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
          <span className="shrink-0 px-1 text-[11px] text-gray-400 dark:text-white/30">
            {dateLabel}
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/[0.06]" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[75%] px-4 py-2.5 shadow-sm sm:max-w-[65%] ${
            isOwn
              ? "rounded-2xl rounded-br-sm bg-gradient-to-r from-teal-500 to-teal-600 text-white"
              : "rounded-2xl rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-white/[0.06] dark:text-white"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {bodyText}
          </p>

          <div
            className={`mt-1 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`text-[10px] ${
                isOwn ? "text-white/60" : "text-gray-400 dark:text-white/40"
              }`}
            >
              {formatTime(message.created_at)}
            </span>
            {isOwn &&
              (message.read_at ? (
                <CheckCheck className="h-3.5 w-3.5 text-teal-200" />
              ) : (
                <Check className="h-3.5 w-3.5 text-white/50" />
              ))}
          </div>

          {hasIncomingTranslation && (
            <div className="mt-2 border-t border-gray-200/80 pt-2 dark:border-white/[0.08]">
              <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-white/45">
                <Languages className="h-3 w-3 shrink-0 opacity-70" />
                {t("chat.translatedFrom", { language: sourceLangName })}
              </p>
              <button
                type="button"
                onClick={() => setShowOriginalIncoming((v) => !v)}
                className="mt-1 text-left text-[11px] font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
              >
                {showOriginalIncoming
                  ? t("chat.showTranslation")
                  : t("chat.showOriginal")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
