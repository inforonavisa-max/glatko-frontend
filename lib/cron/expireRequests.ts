import { createAdminClient } from "@/supabase/server";
import { createNotification } from "@/lib/supabase/glatko.server";

export async function expireOldRequests() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("glatko_service_requests")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .in("status", ["published", "bidding"])
    .lt("expires_at", new Date().toISOString())
    .select("id, customer_id");

  if (error) throw error;

  for (const request of data || []) {
    await createNotification({
      user_id: request.customer_id,
      type: "status_change",
      title: "Request expired",
      body: "Your service request has expired after 7 days",
      data: { requestId: request.id },
    }).catch(() => {});
  }

  return data?.length || 0;
}
