import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ClipboardList } from "lucide-react";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import { getProfessionalsByStatus } from "@/lib/supabase/glatko.server";
import type { VerificationStatus } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

const STATUS_STYLES: Record<VerificationStatus, string> = {
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-900/20 dark:text-yellow-300",
  in_review:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-900/20 dark:text-blue-300",
  approved:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-900/20 dark:text-green-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-300",
};

const STATUS_KEYS: Record<VerificationStatus, string> = {
  pending: "admin.professionals.pending",
  in_review: "admin.professionals.inReview",
  approved: "admin.professionals.approved",
  rejected: "admin.professionals.rejected",
};

export default async function ProfessionalsAdminPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const t = await getTranslations();
  const professionals = await getProfessionalsByStatus();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.06 }}>
        <BackgroundGrids />
      </div>
      <div className="relative">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {t("admin.professionals.title")}
          </h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-400" />
        </div>

        {professionals.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/80 px-6 py-16 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
            <ClipboardList className="h-12 w-12 text-gray-300 dark:text-white/20" />
            <h2 className="mt-4 font-serif text-lg font-semibold text-gray-700 dark:text-white/70">
              {t("admin.professionals.noApplications")}
            </h2>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {professionals.map((pro) => {
              const name = pro.profile?.full_name ?? pro.business_name ?? "---";
              const initials = name !== "---"
                ? name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
                : "?";
              return (
                <div
                  key={pro.id}
                  className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-teal-200 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-teal-500/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-semibold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/50">
                          {pro.location_city ?? "---"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[pro.verification_status]}`}
                      >
                        {t(STATUS_KEYS[pro.verification_status])}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/[0.06]">
                    <span className="text-xs text-gray-400 dark:text-white/40">
                      {new Date(pro.created_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/${locale}/admin/professionals/${pro.id}`}
                      className="text-xs font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      {t("admin.professionals.viewDocuments")} &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
