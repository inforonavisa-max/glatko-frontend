import { createAdminClient } from "@/supabase/server";
import { createNotification } from "@/lib/supabase/glatko.server";

interface ThreadRow {
  id: string;
  customer_id: string | null;
  professional_id: string;
  customer_unread_count: number | null;
  pro_unread_count: number | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_sender_id: string | null;
  glatko_service_requests: { title: string | null } | null;
  glatko_professional_profiles: { business_name: string | null } | null;
}

/**
 * Find threads with new messages in the last `windowMinutes` and queue an
 * in-app + email notification for the recipient. The createNotification
 * pipeline owns dedupe (5-min same-thread suppression in dispatch.ts) and
 * user prefs / quiet hours, so this worker just enumerates candidates.
 */
export async function notifyNewMessages(
  windowMinutes = 10,
): Promise<{ scanned: number; notified: number }> {
  const admin = createAdminClient();
  const since = new Date(
    Date.now() - windowMinutes * 60 * 1000,
  ).toISOString();

  const { data: threads, error } = await admin
    .from("glatko_message_threads")
    .select(
      `
      id,
      customer_id,
      professional_id,
      customer_unread_count,
      pro_unread_count,
      last_message_at,
      last_message_preview,
      last_message_sender_id,
      glatko_service_requests ( title ),
      glatko_professional_profiles ( business_name )
      `,
    )
    .gte("last_message_at", since)
    .eq("status", "active")
    .or("customer_unread_count.gt.0,pro_unread_count.gt.0");

  if (error) {
    console.error("[GLATKO:cron-msgs] thread scan failed:", error.message);
    return { scanned: 0, notified: 0 };
  }

  const rows = (threads as unknown as ThreadRow[]) ?? [];
  let notified = 0;

  for (const t of rows) {
    if (!t.last_message_sender_id || !t.last_message_at) continue;

    const recipientId =
      t.last_message_sender_id === t.customer_id
        ? t.professional_id
        : t.customer_id;
    if (!recipientId) continue;

    // Sanity: only fire if recipient actually has unread messages on
    // their side (sender's own messages don't bump their counter).
    const recipientHasUnread =
      recipientId === t.customer_id
        ? (t.customer_unread_count ?? 0) > 0
        : (t.pro_unread_count ?? 0) > 0;
    if (!recipientHasUnread) continue;

    const senderName =
      t.glatko_professional_profiles?.business_name?.trim() ||
      "Someone";
    const preview = t.last_message_preview ?? "";
    const requestTitle = t.glatko_service_requests?.title ?? "";

    try {
      await createNotification({
        user_id: recipientId,
        type: "thread_message",
        title: senderName,
        body: preview,
        data: {
          threadId: t.id,
          requestTitle,
        },
      });
      notified += 1;
    } catch (err) {
      console.error("[GLATKO:cron-msgs] notify failed:", err);
    }
  }

  return { scanned: rows.length, notified };
}
