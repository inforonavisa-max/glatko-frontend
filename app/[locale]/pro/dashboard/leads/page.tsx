import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LeadsList } from "@/components/glatko/pro/LeadsList";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function ProLeadsPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?redirect=/pro/dashboard/leads`);

  // G-REQ-2 incoming leads — algorithm-matched notifications. Only rows
  // where notified_at is set; wait-list (notified_at NULL) are hidden
  // until cron flips them.
  const { data: notifications, error } = await supabase
    .from("glatko_request_notifications")
    .select(
      `
      id,
      request_id,
      match_score,
      match_rank,
      is_primary,
      notified_at,
      viewed_at,
      quote_id,
      glatko_service_requests!inner (
        id,
        title,
        description,
        category_id,
        municipality,
        budget_min,
        budget_max,
        preferred_date_start,
        preferred_date_end,
        urgency,
        status,
        created_at,
        glatko_service_categories (
          slug,
          name
        )
      ),
      glatko_request_quotes (
        id,
        price_amount,
        price_currency,
        status,
        submitted_at
      )
      `,
    )
    .eq("professional_id", user.id)
    .not("notified_at", "is", null)
    .order("notified_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[GLATKO:leads] notifications fetch failed:", error);
  }

  // Map (request_id → thread + pro_unread_count) so the lead card can
  // show "View thread" with an unread badge when a chat already exists.
  const requestIds = (notifications ?? [])
    .map((n) => n.request_id as string)
    .filter(Boolean);

  const threadByRequestId: Record<
    string,
    { thread_id: string; pro_unread_count: number }
  > = {};
  if (requestIds.length > 0) {
    const { data: threads } = await supabase
      .from("glatko_message_threads")
      .select("id, request_id, pro_unread_count")
      .eq("professional_id", user.id)
      .in("request_id", requestIds);
    for (const t of threads ?? []) {
      threadByRequestId[t.request_id as string] = {
        thread_id: t.id as string,
        pro_unread_count: (t.pro_unread_count as number) ?? 0,
      };
    }
  }

  return (
    <LeadsList
      leads={JSON.parse(JSON.stringify(notifications ?? []))}
      threadByRequestId={threadByRequestId}
      locale={locale}
    />
  );
}
