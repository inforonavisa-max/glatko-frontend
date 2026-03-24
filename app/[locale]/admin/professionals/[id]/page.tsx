import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getProfessionalProfile,
  getVerificationDocuments,
} from "@/lib/supabase/glatko.server";
import { AdminActions } from "@/components/glatko/admin/AdminActions";
import { BackgroundGrids } from "@/components/aceternity/background-grids";
import type { VerificationStatus, DocumentStatus } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string };
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

const DOC_STATUS_STYLES: Record<DocumentStatus, string> = {
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-900/20 dark:text-yellow-300",
  approved:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-900/20 dark:text-green-300",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-300",
};

export default async function ProfessionalDetailPage({ params }: Props) {
  const { locale, id } = await Promise.resolve(params);
  setRequestLocale(locale);

  const t = await getTranslations();
  const [profile, documents] = await Promise.all([
    getProfessionalProfile(id),
    getVerificationDocuments(id),
  ]);

  if (!profile) {
    notFound();
  }

  const displayName =
    profile.profile?.full_name ?? profile.business_name ?? "---";

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.06 }}>
        <BackgroundGrids />
      </div>
      <div className="relative">
      <Link
        href={`/${locale}/admin/professionals`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-white/50 dark:hover:text-white"
      >
        &larr; {t("common.back")}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {displayName}
          </h1>
          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[profile.verification_status]}`}
          >
            {t(STATUS_KEYS[profile.verification_status])}
          </span>
        </div>
      </div>

      {/* Personal information */}
      <section className="mt-8 rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] md:p-8">
        <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
          {t("admin.professionals.personalInfo")}
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label={t("admin.professionals.applicant")} value={displayName} />
          <InfoItem label={t("pro.wizard.businessName")} value={profile.business_name} />
          <InfoItem label={t("pro.wizard.phone")} value={profile.phone} />
          <InfoItem label={t("pro.profile.location")} value={profile.location_city} />
          <InfoItem
            label={t("pro.profile.languages")}
            value={profile.languages.length > 0 ? profile.languages.join(", ") : null}
          />
          <InfoItem
            label={t("pro.wizard.experience")}
            value={
              profile.years_experience != null
                ? `${profile.years_experience} ${t("pro.profile.yearsExp")}`
                : null
            }
          />
          <InfoItem
            label={t("pro.profile.hourlyRate")}
            value={
              profile.hourly_rate_min != null || profile.hourly_rate_max != null
                ? `${profile.hourly_rate_min ?? "---"} - ${profile.hourly_rate_max ?? "---"} EUR`
                : null
            }
          />
        </dl>

        {profile.bio && (
          <div className="mt-6">
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/50">
              {t("pro.wizard.bio")}
            </dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-gray-700 dark:text-white/80">
              {profile.bio}
            </dd>
          </div>
        )}
      </section>

      {/* Services */}
      {profile.services && profile.services.length > 0 && (
        <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] md:p-8">
          <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.professionals.serviceAreas")}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.services.map((svc) => (
              <li
                key={svc.id}
                className={`rounded-full border px-3 py-1 text-sm ${
                  svc.is_primary
                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-900/20 dark:text-teal-300"
                    : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70"
                }`}
              >
                {svc.category?.slug ?? svc.category_id}
                {svc.is_primary && (
                  <span className="ml-1 text-xs opacity-60">
                    ({t("pro.wizard.primaryService")})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Documents */}
      <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] md:p-8">
        <h2 className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
          {t("admin.professionals.documents")}
        </h2>
        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500 dark:text-white/50">
            &mdash;
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100 dark:divide-white/10">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {doc.document_type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">
                    {new Date(doc.created_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${DOC_STATUS_STYLES[doc.status]}`}
                >
                  {doc.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions */}
      <section className="mt-8">
        <AdminActions
          professionalId={profile.id}
          currentStatus={profile.verification_status}
        />
      </section>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-white/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
        {value ?? "---"}
      </dd>
    </div>
  );
}
