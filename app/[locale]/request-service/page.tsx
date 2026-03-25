import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { getServiceCategories } from "@/lib/supabase/glatko.server";
import { RequestServiceWizard } from "@/components/glatko/request-service/RequestServiceWizard";
import { PageBackground } from "@/components/ui/PageBackground";
import type { ServiceCategory } from "@/types/glatko";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function RequestServicePage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/request-service`);
  }

  const categories: ServiceCategory[] = await getServiceCategories();

  return (
    <PageBackground opacity={0.1}>
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <RequestServiceWizard categories={categories} />
      </div>
    </PageBackground>
  );
}
