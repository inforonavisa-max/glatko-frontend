"use server";

import { createClient } from "@/supabase/server";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/lib/supabase/glatko.server";

export async function getNotificationsAction(limit = 20, unreadOnly = false) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return getUserNotifications(user.id, limit, unreadOnly);
}

export async function markReadAction(notificationId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await markNotificationRead(notificationId, user.id);
}

export async function markAllReadAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await markAllNotificationsRead(user.id);
}

export async function getUnreadCountAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  return getUnreadNotificationCount(user.id);
}
