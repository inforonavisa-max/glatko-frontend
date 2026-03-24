import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/supabase/server";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getServiceRequest } from "@/lib/supabase/glatko.server";
import { Link } from "@/i18n/navigation";
import { SpotlightCard } from "@/components/landing/spotlight-card";
import { CancelRequestButton } from "@/components/glatko/dashboard/CancelRequestButton";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Phone,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/50",
  published: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  bidding: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  assigned: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  completed: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  reviewed: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  closed: "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/50",
  expired: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  cancelled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const TIMELINE_STATUSES: RequestStatus[] = [
  "published",
  "bidding",
  "assigned",
  "in_progress",
  "completed",
];

export default async function RequestDetailPage({ params }: Props) {
  const resolved = await Promise.resolve(params);
  const { locale, id } = resolved;
  setRequestLocale(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/dashboard/requests/${id}`);
  }

  const request = await getServiceRequest(id);
  if (!request) notFound();

  const t = await getTranslations();

  const status = (request.status as RequestStatus) ?? "draft";
  const isCancellable = ["draft", "published", "bidding"].includes(status);
  const catName =
    request.category?.name?.[locale as keyof typeof request.category.name] ??
    request.category?.name?.en ??
    "";

  const createdDate = new Date(request.created_at).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusIdx = TIMELINE_STATUSES.indexOf(status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <Link
        href="/dashboard/requests"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-teal-600 dark:text-white/50 dark:hover:text-teal-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("dashboard.detail.back")}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {request.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
            {catName} &middot; {createdDate}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium",
            STATUS_COLOR[status] ?? STATUS_COLOR.draft
          )}
        >
          {t(`dashboard.requests.status.${status}`)}
        </span>
      </div>

      <SpotlightCard className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
          {t("dashboard.detail.timeline")}
        </h2>
        <div className="flex items-center gap-2">
          {TIMELINE_STATUSES.map((s, i) => {
            const reached = statusIdx >= i;
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    reached
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-gray-200 text-gray-400 dark:border-white/10 dark:text-white/30"
                  )}
                >
                  {i + 1}
                </div>
                {i < TIMELINE_STATUSES.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      statusIdx > i
                        ? "bg-teal-500"
                        : "bg-gray-200 dark:bg-white/10"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex text-[10px] text-gray-400 dark:text-white/30">
          {TIMELINE_STATUSES.map((s) => (
            <div key={s} className="flex-1 text-center">
              {t(`dashboard.requests.status.${s}`)}
            </div>
          ))}
        </div>
      </SpotlightCard>

      <SpotlightCard className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
          {t("dashboard.detail.details")}
        </h2>
        <div className="space-y-3">
          {request.description && (
            <p className="text-sm text-gray-700 dark:text-white/70">
              {request.description}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {request.municipality && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <MapPin className="h-4 w-4 text-teal-500" />
                {request.municipality}
                {request.address && ` - ${request.address}`}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
              <Clock className="h-4 w-4 text-teal-500" />
              {t(`request.step3.urgency.${request.urgency}`)}
            </div>
            {request.preferred_date_start && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <Calendar className="h-4 w-4 text-teal-500" />
                {request.preferred_date_start}
                {request.preferred_date_end && ` - ${request.preferred_date_end}`}
              </div>
            )}
            {(request.budget_min || request.budget_max) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <DollarSign className="h-4 w-4 text-teal-500" />
                {request.budget_min && `${request.budget_min}`}
                {request.budget_min && request.budget_max && " - "}
                {request.budget_max && `${request.budget_max}`} EUR
              </div>
            )}
            {(request.details as Record<string, unknown>)?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/60">
                <Phone className="h-4 w-4 text-teal-500" />
                {String((request.details as Record<string, unknown>).phone)}
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>

      {request.photos && (request.photos as string[]).length > 0 && (
        <SpotlightCard className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
            <ImageIcon className="h-4 w-4" />
            {t("dashboard.detail.photos")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {(request.photos as string[]).map((url: string) => (
              <div key={url} className="h-24 w-24 overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      <SpotlightCard className="mb-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">
          <MessageSquare className="h-4 w-4" />
          {t("dashboard.detail.bids")} ({request.bid_count ?? 0})
        </h2>
        {(!request.bids || (request.bids as unknown[]).length === 0) ? (
          <p className="text-sm text-gray-500 dark:text-white/50">
            {t("dashboard.detail.noBids")}
          </p>
        ) : (
          <div className="space-y-3">
            {(request.bids as Array<{
              id: string;
              price: number;
              price_type: string;
              message: string | null;
              status: string;
              professional?: {
                business_name: string | null;
                avg_rating: number;
                is_verified: boolean;
              };
            }>).map((bid) => (
              <div
                key={bid.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bid.professional?.business_name ?? t("dashboard.detail.anonymous")}
                  </span>
                  <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {bid.price} EUR
                  </span>
                </div>
                {bid.message && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-white/60">
                    {bid.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>

      {isCancellable && (
        <div className="flex justify-end">
          <CancelRequestButton requestId={id} userId={user.id} />
        </div>
      )}
    </div>
  );
}
