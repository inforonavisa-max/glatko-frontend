"use client";

import { useTranslations } from "next-intl";
import { PageBackground } from "@/components/ui/PageBackground";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassmorphCard } from "@/components/ui/GlassmorphCard";
import { Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations();
  const c = (key: string) => t(`legal.contactContent.${key}`);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT;
  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <SectionTitle>{t("legal.contact")}</SectionTitle>
        <GlassmorphCard className="p-8 md:p-12" hover={false}>
          <p className="mb-8 text-sm text-gray-600 dark:text-white/60">{c("intro")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">{c("emailLabel")}</p>
                <a href={`mailto:${c("email")}`} className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400">{c("email")}</a>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">{c("addressLabel")}</p>
                <p className="text-sm text-gray-700 dark:text-white/70">{c("address")}</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">{c("hoursLabel")}</p>
                <p className="text-sm text-gray-700 dark:text-white/70">{c("hours")}</p>
              </div>
            </div>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello, I'm reaching out via Glatko.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 p-5 transition-colors hover:bg-[#25D366]/10"
              >
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30">{c("whatsappLabel")}</p>
                  <p className="text-sm text-gray-700 dark:text-white/70">{c("whatsappDesc")}</p>
                </div>
              </a>
            )}
          </div>
        </GlassmorphCard>
      </div>
    </PageBackground>
  );
}
