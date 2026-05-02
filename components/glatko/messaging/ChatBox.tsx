"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/supabase/browser";
import { sendMessage } from "@/app/[locale]/messages/actions";

interface ThreadMessage {
  id: string;
  sender_id: string;
  body: string;
  body_locale: string | null;
  read_at: string | null;
  created_at: string;
}

interface Props {
  threadId: string;
  currentUserId: string;
  counterpartName: string;
  counterpartAvatar: string | null;
  requestTitle: string;
  initialMessages: ThreadMessage[];
  locale: string;
  threadActive: boolean;
}

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBox({
  threadId,
  currentUserId,
  counterpartName,
  counterpartAvatar,
  requestTitle,
  initialMessages,
  locale,
  threadActive,
}: Props) {
  const t = useTranslations();
  const supabase = createClient();

  const [messages, setMessages] = useState<ThreadMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const firstScrollDone = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollToBottom(firstScrollDone.current ? "smooth" : "auto");
      firstScrollDone.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [messages.length, scrollToBottom]);

  // Realtime subscription — postgres_changes INSERT on glatko_thread_messages
  useEffect(() => {
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "glatko_thread_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as ThreadMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read if it's from the counterpart
          if (newMsg.sender_id !== currentUserId) {
            void supabase.rpc("glatko_mark_thread_read", {
              p_thread_id: threadId,
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId, currentUserId, supabase]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic: ThreadMessage = {
      id: tempId,
      sender_id: currentUserId,
      body: trimmed,
      body_locale: locale,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");

    try {
      const result = await sendMessage({
        thread_id: threadId,
        body: trimmed,
        body_locale: locale,
      });
      if (!result.success) {
        // Roll back optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError(result.error ?? t("messaging.sendError"));
        setBody(trimmed);
      } else {
        // Replace temp with real id (Realtime will also deliver but dedupe handles it)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: result.data?.message_id ?? m.id,
                }
              : m,
          ),
        );
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err instanceof Error ? err.message : t("messaging.sendError"));
      setBody(trimmed);
    } finally {
      setSending(false);
    }
  }

  const initial = (counterpartName || "—").substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-h-[100dvh] pt-16">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 flex items-center gap-3">
        <Link
          href={`/${locale}/messages`}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          aria-label={t("messaging.back")}
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-neutral-300" />
        </Link>
        {counterpartAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={counterpartAvatar}
            alt={counterpartName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-neutral-700"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 dark:text-white truncate">
            {counterpartName}
          </h1>
          {requestTitle && (
            <p className="text-xs text-gray-500 dark:text-neutral-500 truncate">
              {requestTitle}
            </p>
          )}
        </div>
      </div>

      {/* Message list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 space-y-2 bg-gray-50 dark:bg-neutral-950"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-500 dark:text-neutral-500">
            <p className="text-sm">{t("messaging.threadEmptyHint")}</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    mine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {m.body}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs ${
                      mine
                        ? "text-blue-100/80 justify-end"
                        : "text-gray-500 dark:text-neutral-500"
                    }`}
                  >
                    <span>{formatTime(m.created_at, locale)}</span>
                    {mine && m.read_at && (
                      <span aria-label={t("messaging.read")}>· ✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      {threadActive ? (
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3"
        >
          {error && (
            <div className="mb-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(
                    e as unknown as FormEvent<HTMLFormElement>,
                  );
                }
              }}
              disabled={sending}
              rows={1}
              maxLength={5000}
              placeholder={t("messaging.composerPlaceholder")}
              className="flex-1 resize-none px-4 py-2 rounded-2xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              aria-label={t("messaging.send")}
              className="p-3 rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-4 py-3 text-center text-sm text-gray-600 dark:text-neutral-400">
          {t("messaging.threadInactive")}
        </div>
      )}
    </div>
  );
}
