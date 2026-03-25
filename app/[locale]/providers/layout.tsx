import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
    alternates: {
      canonical: `/${locale}/providers`,
      languages: Object.fromEntries(["tr","en","de","it","ru","uk","sr","me","ar"].map(l => [l, `/${l}/providers`])),
    },
    robots: { index: true, follow: true },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
