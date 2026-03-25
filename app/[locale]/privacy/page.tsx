"use client";

import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";

const ALL_SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"] as const;

export default function PrivacyPage() {
  const t = useTranslations();
  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <SectionTitle>{t("legal.privacy")}</SectionTitle>
        <GlassmorphCard className="p-8 md:p-12" hover={false}>
          <p className="mb-2 text-xs text-gray-400 dark:text-white/30">
            {t("legal.lastUpdated")}: {t("legal.effectiveDate")}
          </p>
          <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-white/60">
            <p>{t("legal.privacyContent.intro")}</p>
            {ALL_SECTIONS.map((s) => {
              const titleKey = `legal.privacyContent.${s}Title` as const;
              const bodyKey = `legal.privacyContent.${s}` as const;
              const title = t.has(titleKey) ? t(titleKey) : null;
              if (!title) return null;
              return (
                <div key={s}>
                  <h2 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <p className="mt-1.5">{t(bodyKey)}</p>
                </div>
              );
            })}
          </div>
        </GlassmorphCard>
      </div>
    </PageBackground>
  );
}
