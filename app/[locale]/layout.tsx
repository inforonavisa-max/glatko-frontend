import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { GlatkoHeader } from "@/components/GlatkoHeader";
import { GlatkoFooter } from "@/components/GlatkoFooter";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";
import { createClient } from "@/supabase/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
};

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
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  return (
    <NextIntlClientProvider messages={messages}>
      <NuqsAdapter>
        <HtmlLangSetter lang={locale} dir={dir} />
        <div className="flex min-h-screen flex-col" dir={dir}>
          <GlatkoHeader userId={userId} />
          <main className="flex-1">{children}</main>
          <GlatkoFooter />
        </div>
      </NuqsAdapter>
    </NextIntlClientProvider>
  );
}
