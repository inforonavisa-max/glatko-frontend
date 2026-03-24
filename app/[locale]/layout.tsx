import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GlatkoHeader } from "@/components/GlatkoHeader";
import { GlatkoFooter } from "@/components/GlatkoFooter";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const RTL_LOCALES = new Set(["ar"]);

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider messages={messages}>
      <NuqsAdapter>
        <HtmlLangSetter lang={locale} dir={dir} />
        <div className="flex min-h-screen flex-col" dir={dir}>
          <GlatkoHeader />
          <main className="flex-1">{children}</main>
          <GlatkoFooter />
        </div>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
