"use server";

import { createClient } from "@/supabase/server";
import { sendMessage } from "@/lib/supabase/glatko.server";

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, error: "Empty message" };
  }
  const MAX_LEN = 8000;
  if (trimmed.length > MAX_LEN) {
    return { success: false, error: "Message too long" };
  }

  try {
    await sendMessage({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}
