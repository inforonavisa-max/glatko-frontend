import { setRequestLocale } from "next-intl/server";
import { getServiceCategories } from "@/lib/supabase/glatko.server";
import { RequestServiceWizard } from "@/components/glatko/request-service/RequestServiceWizard";
import { PageBackground } from "@/components/ui/PageBackground";
import type { ServiceCategory } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

/**
 * G-REQ-1 anonim flow: the wizard is reachable without a session. If a
 * user IS signed in, `submitServiceRequest` reads their id off the auth
 * cookie; otherwise the form collects an `anonymous_email` in the final
 * step (Airbnb pattern).
 */
export default async function RequestServicePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const categories: ServiceCategory[] = await getServiceCategories();

  return (
    <PageBackground opacity={0.1}>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <RequestServiceWizard categories={categories} />
      </div>
    </PageBackground>
  );
}
