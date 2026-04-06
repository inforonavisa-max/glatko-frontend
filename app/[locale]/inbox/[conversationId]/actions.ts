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

  try {
    await sendMessage({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed",
    };
  }
}
