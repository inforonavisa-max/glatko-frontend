"use server";

import { createClient } from "@/supabase/server";
import { cancelServiceRequest, acceptBid, getOrCreateConversation, sendMessage } from "@/lib/supabase/glatko.server";

interface CancelResult {
  success: boolean;
  error?: string;
}

export async function cancelRequest(
  requestId: string,
  userId: string
): Promise<CancelResult> {
  if (!requestId || !userId) {
    return { success: false, error: "Missing request or user ID." };
  }

  const result = await cancelServiceRequest(requestId, userId);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function acceptBidAction(
  bidId: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await acceptBid(bidId, requestId, user.id);
    
    const { data: bid } = await supabase
      .from("glatko_bids")
      .select("professional_id")
      .eq("id", bidId)
      .single();
    
    if (bid) {
      const conversation = await getOrCreateConversation({
        service_request_id: requestId,
        bid_id: bidId,
        customer_id: user.id,
        professional_id: bid.professional_id,
      });
      
      await sendMessage({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: "✅ Bid accepted! You can now discuss the details here.",
        content_type: "text",
      });
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
