"use server";

import { createClient } from "@/supabase/server";
import { withdrawBid } from "@/lib/supabase/glatko.server";

export async function withdrawBidAction(bidId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await withdrawBid(bidId, user.id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed" };
  }
}
