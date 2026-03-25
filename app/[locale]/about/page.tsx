"use client";

import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";

export default function AboutPage() {
  const t = useTranslations();
  const c = (key: string) => t(`legal.aboutContent.${key}`);
  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <SectionTitle>{t("legal.about")}</SectionTitle>
        <GlassmorphCard className="p-8 md:p-12" hover={false}>
          <div className="space-y-5 text-sm leading-relaxed text-gray-600 dark:text-white/60">
            <p>{c("intro")}</p>
            <p>{c("mission")}</p>
            <p>{c("location")}</p>
            <p>{c("services")}</p>
            <p>{c("howItWorks")}</p>
            <p>{c("languages")}</p>
            <p className="pt-4 text-gray-500 dark:text-white/40">
              {c("contactLine")}: <a href={`mailto:${c("contactEmail")}`} className="font-medium text-teal-600 hover:underline dark:text-teal-400">{c("contactEmail")}</a>
            </p>
          </div>
        </GlassmorphCard>
      </div>
    </PageBackground>
  );
}
