"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

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
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
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
    <div className="sticky bottom-0 z-20 border-t border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.03] sm:px-6 lg:border-gray-200 lg:bg-white/80">
      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled
          title={t("chat.attachPhoto")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/30 dark:text-white/30 lg:text-gray-300"
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
          className="flex-1 resize-none rounded-full bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-shadow focus:ring-2 focus:ring-teal-500/30 dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 lg:bg-gray-100 lg:text-gray-900 lg:placeholder-gray-400"
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isEmpty || sending || disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-opacity disabled:opacity-40"
        >
          {sending ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Send className="h-4.5 w-4.5" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
