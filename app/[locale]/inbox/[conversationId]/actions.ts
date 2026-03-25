"use server";

import { createClient } from "@/supabase/server";
import { sendMessage, createNotification } from "@/lib/supabase/glatko.server";

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await sendMessage({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

    const { data: conv } = await supabase
      .from("glatko_conversations")
      .select("customer_id, professional_id")
      .eq("id", conversationId)
      .single();

    if (conv) {
      const recipientId = conv.customer_id === user.id
        ? conv.professional_id
        : conv.customer_id;

      await createNotification({
        user_id: recipientId,
        type: "message",
        title: "New message",
        body: content.substring(0, 100),
        data: { conversationId },
      }).catch(() => {});
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}
