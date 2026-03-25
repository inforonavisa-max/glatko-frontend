import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("auth.register"),
    description: t("brand.tagline"),
    alternates: { languages: Object.fromEntries(["tr","en","de","it","ru","uk","sr","me","ar"].map(l => [l, `/${l}/register`])) },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
