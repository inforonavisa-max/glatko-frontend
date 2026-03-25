"use client";

import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    content: string;
    content_type: string;
    created_at: string;
    read_at: string | null;
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
            {message.content}
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
        </div>
      </motion.div>
    </>
  );
}
