import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/supabase/server";
import { getServiceCategories } from "@/lib/supabase/glatko.server";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo";
import { RequestServiceWizard } from "@/components/glatko/request-service/RequestServiceWizard";
import { PageBackground } from "@/components/ui/PageBackground";
import type { ServiceCategory } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale });
  return {
    title: `${t("request.title")} — Glatko`,
    description: t("request.subtitle"),
    alternates: buildAlternates(locale, "/request-service"),
    robots: { index: true, follow: true },
  };
}

/**
 * G-REQ-1 anonim flow: the wizard is reachable without a session. We still
 * fetch the user here so the wizard can adapt its UI (anonymous users see
 * a required-email hint and trigger the localStorage draft persistence).
 * `submitServiceRequest` re-reads auth from cookies on the server side, so
 * the userId we hand to the client is purely a UX signal — never trusted
 * for authorization.
 */
export default async function RequestServicePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const categories: ServiceCategory[] = await getServiceCategories();

  return (
    <PageBackground opacity={0.1}>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <RequestServiceWizard
          categories={categories}
          userId={user?.id ?? null}
        />
      </div>
    </PageBackground>
  );
}
