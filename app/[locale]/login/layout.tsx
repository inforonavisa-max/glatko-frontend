import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HreflangLinks } from "@/components/seo/HreflangLinks";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("auth.login"),
    description: t("brand.tagline"),
  };
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <>
      <HreflangLinks locale={locale} path="/login" />
      {children}
    </>
  );
}
