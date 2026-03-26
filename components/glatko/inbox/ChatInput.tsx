"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowUp, Paperclip, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const t = useTranslations();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className="sticky bottom-0 z-20 border-t border-gray-200/50 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-white/[0.06] dark:bg-[#080808]/80 sm:px-6">
      <div className="flex items-end gap-3">
        <button
          type="button"
          disabled
          title={t("chat.attachPhoto")}
          aria-label={t("chat.attachPhoto")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-300 dark:text-white/20"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          disabled={disabled}
          className={cn(
            "max-h-32 flex-1 resize-none overflow-y-auto rounded-2xl border px-4 py-2.5 text-sm transition-all",
            "border-gray-200 bg-gray-100 text-gray-900 placeholder-gray-400",
            "dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white dark:placeholder-white/30",
            "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
          )}
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={isEmpty || sending || disabled}
          aria-label={t("chat.send")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 disabled:opacity-40 disabled:shadow-none"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
