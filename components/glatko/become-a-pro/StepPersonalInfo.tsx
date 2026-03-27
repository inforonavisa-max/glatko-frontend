"use client";

import { cn } from "@/lib/utils";
import type { useTranslations } from "next-intl";
import { ProWizardAvatarUpload } from "./ProWizardAvatarUpload";

const CITY_SLUGS = [
  "budva",
  "kotor",
  "tivat",
  "podgorica",
  "hercegNovi",
  "bar",
  "ulcinj",
] as const;

const LANGUAGES = ["TR", "EN", "DE", "IT", "RU", "UK", "SR", "ME", "AR"];

const inputCls = cn(
  "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5",
  "py-3 px-4 text-sm text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-white/30",
  "focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-all"
);

const labelCls = "text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5";

export interface StepPersonalInfoProps {
  businessName: string;
  setBusinessName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  languages: string[];
  toggleLanguage: (lang: string) => void;
  experience: string;
  setExperience: (v: string) => void;
  hourlyMin: string;
  setHourlyMin: (v: string) => void;
  hourlyMax: string;
  setHourlyMax: (v: string) => void;
  userEmail: string;
  displayName: string | null;
  avatarUrl: string;
  onAvatarUrlChange: (url: string) => void;
  t: ReturnType<typeof useTranslations>;
}

export function StepPersonalInfo({
  businessName,
  setBusinessName,
  bio,
  setBio,
  phone,
  setPhone,
  city,
  setCity,
  languages,
  toggleLanguage,
  experience,
  setExperience,
  hourlyMin,
  setHourlyMin,
  hourlyMax,
  setHourlyMax,
  userEmail,
  displayName,
  avatarUrl,
  onAvatarUrlChange,
  t,
}: StepPersonalInfoProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t("pro.wizard.step1Title")}
      </h2>

      <ProWizardAvatarUpload
        displayName={displayName}
        email={userEmail}
        initialUrl={avatarUrl || null}
        onUrlChange={onAvatarUrlChange}
      />

      <div>
        <label className={labelCls}>{t("pro.wizard.businessName")}</label>
        <input
          className={inputCls}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder={t("pro.wizard.businessNamePlaceholder")}
        />
      </div>

      <div>
        <label className={labelCls}>{t("pro.wizard.bio")}</label>
        <textarea
          className={cn(inputCls, "min-h-[100px] resize-y")}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t("pro.wizard.bioPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t("pro.wizard.phone")}</label>
          <input
            className={inputCls}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+382 ..."
          />
        </div>
        <div>
          <label className={labelCls}>{t("pro.wizard.city")}</label>
          <select
            className={inputCls}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">{t("pro.wizard.selectCity")}</option>
            {CITY_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {t(`cities.${slug}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>{t("pro.wizard.languages")}</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                languages.includes(lang)
                  ? "bg-teal-500 text-white"
                  : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 hover:border-teal-500/50"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelCls}>{t("pro.wizard.experience")}</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelCls}>{t("pro.wizard.hourlyMin")}</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            value={hourlyMin}
            onChange={(e) => setHourlyMin(e.target.value)}
            placeholder="EUR"
          />
        </div>
        <div>
          <label className={labelCls}>{t("pro.wizard.hourlyMax")}</label>
          <input
            className={inputCls}
            type="number"
            min={0}
            value={hourlyMax}
            onChange={(e) => setHourlyMax(e.target.value)}
            placeholder="EUR"
          />
        </div>
      </div>
    </div>
  );
}
