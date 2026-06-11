"use server";

import { createClient } from "@/supabase/server";
import { getUnreadCount } from "@/lib/supabase/glatko.server";

async function getUnreadThreadCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("glatko_message_threads")
    .select("customer_id, customer_unread_count, pro_unread_count")
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`)
    .eq("status", "active");
  if (error || !data) return 0;
  return data.reduce((sum, thread) => {
    const count =
      thread.customer_id === userId
        ? (thread.customer_unread_count ?? 0)
        : (thread.pro_unread_count ?? 0);
    return sum + count;
  }, 0);
}

export async function getUnreadMessageCountAction(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const [legacy, threads] = await Promise.all([
    getUnreadCount(user.id),
    getUnreadThreadCount(user.id),
  ]);
  return legacy + threads;
}
