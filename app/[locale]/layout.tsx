import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GlatkoHeader } from "@/components/GlatkoHeader";
import { GlatkoFooter } from "@/components/GlatkoFooter";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";
import { createClient } from "@/supabase/server";
import { CookieConsent } from "@/components/glatko/CookieConsent";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale });
  return {
    title: t("seo.landingTitle"),
    description: t("seo.landingDesc"),
    openGraph: {
      title: t("seo.landingTitle"),
      description: t("seo.landingDesc"),
      url: `https://glatko.app/${locale}`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
  };
}

const RTL_LOCALES = new Set(["ar"]);

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await Promise.resolve(params);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  const userId = user?.id ?? null;

  let isPro = false;
  if (userId) {
    const { data: proProfile } = await supabase
      .from("glatko_professional_profiles")
      .select("id, verification_status")
      .eq("id", userId)
      .single();
    isPro = !!proProfile && proProfile.verification_status === "approved";
  }

  return (
    <NextIntlClientProvider messages={messages}>
      <NuqsAdapter>
        <HtmlLangSetter lang={locale} dir={dir} />
        <div className="flex min-h-screen flex-col" dir={dir}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-xl focus:bg-teal-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            Skip to content
          </a>
          <GlatkoHeader userId={userId} isPro={isPro} />
          <main id="main-content" className="flex-1">{children}</main>
          <GlatkoFooter />
          <CookieConsent />
        </div>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
