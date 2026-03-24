import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getProfessionalsByStatus } from "@/lib/supabase/glatko.server";
import type { VerificationStatus } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

const STATUS_STYLES: Record<VerificationStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  in_review:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
        {t("admin.professionals.title")}
      </h1>

      {professionals.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 dark:border-white/10 dark:bg-white/5">
          <p className="text-gray-500 dark:text-white/50">
            {t("admin.professionals.noApplications")}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("admin.professionals.applicant")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("pro.profile.location")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("admin.professionals.serviceAreas")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("admin.professionals.appliedAt")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("admin.professionals.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
                  {t("admin.professionals.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-transparent">
              {professionals.map((pro) => (
                <tr
                  key={pro.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {pro.profile?.full_name ?? pro.business_name ?? "---"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-white/70">
                    {pro.location_city ?? "---"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-white/70">
                    &mdash;
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-white/70">
                    {new Date(pro.created_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[pro.verification_status]}`}
                    >
                      {t(STATUS_KEYS[pro.verification_status])}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      href={`/${locale}/admin/professionals/${pro.id}`}
                      className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      {t("admin.professionals.viewDocuments")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
