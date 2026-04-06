"use server";

import { createClient } from "@/supabase/server";
import { getUnreadCount } from "@/lib/supabase/glatko.server";

export async function getUnreadMessageCountAction(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  return getUnreadCount(user.id);
}
