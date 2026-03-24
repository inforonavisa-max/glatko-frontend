"use client";

import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations();
  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <SectionTitle>{t("legal.contact")}</SectionTitle>
        <GlassmorphCard className="p-8 md:p-12" hover={false}>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10">
              <Mail className="h-7 w-7 text-teal-500" />
            </div>
            <p className="max-w-md text-sm text-gray-500 dark:text-white/50">
              {t("legal.comingSoon")}
            </p>
          </div>
        </GlassmorphCard>
      </div>
    </PageBackground>
  );
}
