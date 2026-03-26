import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HreflangLinks } from "@/components/seo/HreflangLinks";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("seo.providersTitle"),
    description: t("seo.providersDesc"),
    openGraph: {
      title: t("seo.providersTitle"),
      description: t("seo.providersDesc"),
      url: `https://glatko.app/${locale}/providers`,
      siteName: "Glatko",
      locale,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <>
      <HreflangLinks locale={locale} path="/providers" />
      {children}
    </>
  );
}
