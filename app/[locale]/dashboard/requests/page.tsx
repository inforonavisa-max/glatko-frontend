import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getCustomerRequests } from "@/lib/supabase/glatko.server";
import { Link } from "@/i18n/navigation";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { Clock, CheckCircle, AlertCircle, XCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

const STATUS_CONFIG: Record<
  RequestStatus,
  { color: string; bgColor: string; borderColor: string }
> = {
  draft: { color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-white/10", borderColor: "border-gray-200 dark:border-white/10" },
  published: { color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-50 dark:bg-teal-500/10", borderColor: "border-teal-200 dark:border-teal-500/20" },
  bidding: { color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", borderColor: "border-blue-200 dark:border-blue-500/20" },
  assigned: { color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-500/10", borderColor: "border-indigo-200 dark:border-indigo-500/20" },
  in_progress: { color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-500/10", borderColor: "border-amber-200 dark:border-amber-500/20" },
  completed: { color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-500/10", borderColor: "border-green-200 dark:border-green-500/20" },
  reviewed: { color: "text-green-700 dark:text-green-300", bgColor: "bg-green-50 dark:bg-green-500/10", borderColor: "border-green-200 dark:border-green-500/20" },
  closed: { color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-white/10", borderColor: "border-gray-200 dark:border-white/10" },
  expired: { color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-500/10", borderColor: "border-orange-200 dark:border-orange-500/20" },
  cancelled: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10", borderColor: "border-red-200 dark:border-red-500/20" },
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  published: Clock,
  bidding: Clock,
  completed: CheckCircle,
  reviewed: CheckCircle,
  in_progress: AlertCircle,
  cancelled: XCircle,
  expired: XCircle,
};

export default async function DashboardRequestsPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/dashboard/requests`);
  }

  const t = await getTranslations();
  const requests = await getCustomerRequests(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          {t("dashboard.requests.title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-white/50">
          {t("dashboard.requests.subtitle")}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
            <Inbox className="h-8 w-8 text-gray-400 dark:text-white/30" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t("dashboard.requests.empty")}
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-white/50">
            {t("dashboard.requests.emptyDesc")}
          </p>
          <Link
            href="/request-service"
            className="mt-6 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-600"
          >
            {t("dashboard.requests.createFirst")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const status = (req.status as RequestStatus) ?? "draft";
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
            const StatusIcon = STATUS_ICONS[status] ?? Clock;
            const catName =
              req.category?.name?.[locale as keyof typeof req.category.name] ??
              req.category?.name?.en ??
              "";
            const date = new Date(req.created_at).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <Link key={req.id} href={`/dashboard/requests/${req.id}`}>
                <SpotlightCard className="cursor-pointer">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                        {req.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                        {catName && <span>{catName}</span>}
                        {req.municipality && (
                          <>
                            <span className="text-gray-300 dark:text-white/20">|</span>
                            <span>{req.municipality}</span>
                          </>
                        )}
                        <span className="text-gray-300 dark:text-white/20">|</span>
                        <span>{date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.bid_count > 0 && (
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                          {req.bid_count} {t("dashboard.requests.bids")}
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                          cfg.color,
                          cfg.bgColor,
                          cfg.borderColor
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {t(`dashboard.requests.status.${status}`)}
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
