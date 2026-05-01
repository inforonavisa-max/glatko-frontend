import { ClipboardList } from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";

import { createAdminClient } from "@/supabase/server";
import { AdminRequestsList } from "@/components/admin/AdminRequestsList";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export interface AdminRequestRow {
  id: string;
  customer_id: string | null;
  anonymous_email: string | null;
  category_id: string;
  category_name: Record<string, string> | null;
  category_slug: string | null;
  details: Record<string, unknown>;
  municipality: string;
  address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date_start: string | null;
  preferred_date_end: string | null;
  urgency: string | null;
  photos: string[] | null;
  locale: string | null;
  status: string;
  created_at: string;
}

/**
 * G-REQ-1 Faz 8: admin moderation queue.
 *
 * `app/[locale]/admin/layout.tsx` already gates non-admins (login redirect
 * + isAdminEmail check), so we don't repeat that here. We use the
 * service-role client so we don't have to ship admin-specific RLS
 * policies — the layout-level email gate is the authorization boundary.
 */
export default async function AdminRequestsPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const t = await getTranslations();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("glatko_service_requests")
    .select(
      `id, customer_id, anonymous_email, category_id, details, municipality,
       address, budget_min, budget_max, preferred_date_start, preferred_date_end,
       urgency, photos, locale, status, created_at,
       category:category_id (slug, name)`,
    )
    .eq("status", "pending_moderation")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows: AdminRequestRow[] = (data ?? []).map((row) => {
    const cat = (row as { category: unknown }).category;
    const catObj = Array.isArray(cat) ? cat[0] : cat;
    return {
      id: row.id as string,
      customer_id: row.customer_id as string | null,
      anonymous_email: row.anonymous_email as string | null,
      category_id: row.category_id as string,
      category_name:
        (catObj as { name?: Record<string, string> } | null)?.name ?? null,
      category_slug:
        (catObj as { slug?: string } | null)?.slug ?? null,
      details: (row.details as Record<string, unknown>) ?? {},
      municipality: row.municipality as string,
      address: row.address as string | null,
      budget_min: row.budget_min as number | null,
      budget_max: row.budget_max as number | null,
      preferred_date_start: row.preferred_date_start as string | null,
      preferred_date_end: row.preferred_date_end as string | null,
      urgency: row.urgency as string | null,
      photos: (row.photos as string[] | null) ?? [],
      locale: row.locale as string | null,
      status: row.status as string,
      created_at: row.created_at as string,
    };
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {t("admin.requests.title")}
          </h1>
          <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
          <p className="mt-3 text-sm text-gray-600 dark:text-white/50">
            {t("admin.requests.subtitle")}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-700 dark:border-teal-500/40 dark:bg-teal-500/15 dark:text-teal-300">
          {rows.length} {t("admin.requests.pending")}
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
          {t("admin.requests.loadError")}: {error.message}
        </div>
      ) : null}

      {rows.length === 0 && !error ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-gray-200/50 bg-white/70 px-6 py-16 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <ClipboardList
            className="h-14 w-14 text-teal-500/30"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 font-serif text-lg font-semibold text-gray-700 dark:text-white/70">
            {t("admin.requests.queueEmpty")}
          </h2>
        </div>
      ) : (
        <AdminRequestsList rows={rows} locale={locale} />
      )}
    </div>
  );
}
