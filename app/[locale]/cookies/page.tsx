"use client";

import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";

const ALL_SECTIONS = ["s1", "s2", "s3", "s4"] as const;

export default function CookiesPage() {
  const t = useTranslations();
  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <SectionTitle>{t("legal.cookies")}</SectionTitle>
        <GlassmorphCard className="p-8 md:p-12" hover={false}>
          <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-white/60">
            <p>{t("legal.cookiesContent.intro")}</p>
            {ALL_SECTIONS.map((s) => {
              const titleKey = `legal.cookiesContent.${s}Title` as const;
              const bodyKey = `legal.cookiesContent.${s}` as const;
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
