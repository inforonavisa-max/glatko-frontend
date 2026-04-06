import { createClient } from "@/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  getConversationMessages,
  markMessagesAsRead,
} from "@/lib/supabase/glatko.server";
import { getTranslations } from "next-intl/server";
import { ChatRoom } from "@/components/glatko/inbox/ChatRoom";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { locale, conversationId } = await params;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: conv, error } = await supabase
    .from("glatko_conversations")
    .select(
      `
      *,
      service_request:glatko_service_requests!glatko_conversations_service_request_id_fkey(id, title),
      customer:profiles!customer_id(id, full_name, avatar_url),
      professional:profiles!professional_id(id, full_name, avatar_url)
    `
    )
    .eq("id", conversationId)
    .single();

  if (error || !conv) notFound();
  if (conv.customer_id !== user.id && conv.professional_id !== user.id)
    notFound();

  const t = await getTranslations();

  let messages: Awaited<ReturnType<typeof getConversationMessages>> = [];
  try {
    messages = await getConversationMessages(conversationId, user.id);
    await markMessagesAsRead(conversationId, user.id);
  } catch {
    // empty
  }

  const isCustomer = conv.customer_id === user.id;
  let proBusinessName: string | null = null;
  if (isCustomer) {
    const { data: pp } = await supabase
      .from("glatko_professional_profiles")
      .select("business_name")
      .eq("id", conv.professional_id)
      .maybeSingle();
    proBusinessName = pp?.business_name ?? null;
  }

  const otherUser = isCustomer
    ? {
        id: conv.professional_id,
        full_name:
          proBusinessName?.trim() ||
          conv.professional?.full_name ||
          t("inbox.counterpartPro"),
        avatar_url: conv.professional?.avatar_url || null,
      }
    : {
        id: conv.customer_id,
        full_name: conv.customer?.full_name || t("inbox.counterpartCustomer"),
        avatar_url: conv.customer?.avatar_url || null,
      };

  return (
    <ChatRoom
      conversationId={conversationId}
      currentUserId={user.id}
      initialMessages={messages}
      otherUser={otherUser}
      requestTitle={conv.service_request?.title || null}
      requestId={conv.service_request?.id || null}
    />
  );
}
