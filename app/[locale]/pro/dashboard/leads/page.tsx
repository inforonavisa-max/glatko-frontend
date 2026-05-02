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

  return (
    <LeadsList
      leads={JSON.parse(JSON.stringify(notifications ?? []))}
      locale={locale}
    />
  );
}
