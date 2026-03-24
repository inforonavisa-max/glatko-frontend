"use client";

import { cn } from "@/lib/utils";

interface Props {
  municipality: string;
  setMunicipality: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  marina: string;
  setMarina: (v: string) => void;
  urgency: string;
  setUrgency: (v: string) => void;
  dateStart: string;
  setDateStart: (v: string) => void;
  dateEnd: string;
  setDateEnd: (v: string) => void;
  showMarina: boolean;
  t: (key: string) => string;
}

const CITY_SLUGS = [
  "budva",
  "kotor",
  "tivat",
  "podgorica",
  "hercegNovi",
  "bar",
  "ulcinj",
] as const;

const MARINA_OPTIONS = [
  "Porto Montenegro",
  "Marina Budva",
  "Marina Bar",
  "Lazure Marina",
  "Marina Kotor",
] as const;

const URGENCY_OPTIONS = [
  "urgent48h",
  "thisWeek",
  "flexible",
  "specificDate",
] as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/70">
      {children}
    </label>
  );
}

export function StepLocation({
  municipality,
  setMunicipality,
  address,
  setAddress,
  marina,
  setMarina,
  urgency,
  setUrgency,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  showMarina,
  t,
}: Props) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {t("request.step3.title")}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-white/50">
        {t("request.step3.subtitle")}
      </p>

      <div className="space-y-6">
        <div>
          <FieldLabel>{t("request.step3.city")}</FieldLabel>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white"
          >
            <option value="">{t("request.step3.selectCity")}</option>
            {CITY_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {t(`cities.${slug}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>{t("request.step3.address")}</FieldLabel>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("request.step3.addressPlaceholder")}
            rows={2}
            className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
          />
        </div>

        {showMarina && (
          <div>
            <FieldLabel>{t("request.step3.marina")}</FieldLabel>
            <select
              value={marina}
              onChange={(e) => setMarina(e.target.value)}
              className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white"
            >
              <option value="">{t("request.step3.selectMarina")}</option>
              {MARINA_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <FieldLabel>{t("request.step3.urgency")}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setUrgency(opt)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  urgency === opt
                    ? "border-teal-500 bg-teal-500/10 text-teal-700 shadow-sm shadow-teal-500/10 dark:bg-teal-500/15 dark:text-teal-300"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-teal-300 hover:bg-teal-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/10"
                )}
              >
                {t(`request.step3.urgency.${opt}`)}
              </button>
            ))}
          </div>
        </div>

        {urgency === "specificDate" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>{t("request.step3.dateStart")}</FieldLabel>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white"
              />
            </div>
            <div>
              <FieldLabel>{t("request.step3.dateEnd")}</FieldLabel>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
