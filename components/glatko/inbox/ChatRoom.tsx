"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/supabase/browser";
import { MessageSquare } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { sendMessageAction } from "@/app/[locale]/inbox/[conversationId]/actions";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_type: string;
  file_url: string | null;
  read_at: string | null;
  created_at: string;
  original_locale?: string | null;
  translated_content?: string | null;
  translated_locale?: string | null;
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
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

function getDateLabel(
  dateStr: string,
  todayLabel: string,
  yesterdayLabel: string
): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) return todayLabel;
  if (msgDay.getTime() === yesterday.getTime()) return yesterdayLabel;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function ChatRoom({
  conversationId,
  currentUserId,
  initialMessages,
  otherUser,
  requestTitle,
  requestId,
  locale,
}: ChatRoomProps) {
  const t = useTranslations();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "glatko_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from("glatko_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  const handleSend = async (content: string) => {
    setSending(true);
    try {
      const result = await sendMessageAction(conversationId, content);
      if (!result.success) {
        toast.error(t("chat.sendFailed"));
      }
    } finally {
      setSending(false);
    }
  };

  const todayLabel = t("inbox.today");
  const yesterdayLabel = t("inbox.yesterday");

  return (
    <div className="box-border flex h-[calc(100dvh-4rem)] min-h-0 max-h-[100dvh] flex-col pt-16 sm:h-[calc(100vh-4rem)] sm:max-h-none">
      <ChatHeader
        otherUser={otherUser}
        requestTitle={requestTitle}
        requestId={requestId}
        locale={locale}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.04]">
              <MessageSquare className="h-6 w-6 text-gray-400 dark:text-white/30" />
            </div>
            <p className="text-sm text-gray-500 dark:text-white/40">
              {t("chat.noMessages")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const showDate =
                  idx === 0 ||
                  !isSameDay(messages[idx - 1].created_at, msg.created_at);
                const dateLabel = showDate
                  ? getDateLabel(msg.created_at, todayLabel, yesterdayLabel)
                  : null;

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender_id === currentUserId}
                    showDate={showDate}
                    dateLabel={dateLabel}
                  />
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}
