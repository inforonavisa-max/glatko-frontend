import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { BecomeAProWizard } from "@/components/glatko/become-a-pro/BecomeAProWizard";

type Props = {
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function BecomeAProPage({ params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/become-a-pro`);
  }

  const { data: existingPro } = await supabase
    .from("glatko_professional_profiles")
    .select("id, verification_status")
    .eq("id", user.id)
    .single();

  const { data: categories } = await supabase
    .from("glatko_service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const t = await getTranslations();

  if (existingPro) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {t("pro.wizard.alreadyPro")}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-white/50">
            {t("pro.wizard.successDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <BecomeAProWizard
        userId={user.id}
        categories={
          (categories ?? []) as import("@/types/glatko").ServiceCategory[]
        }
      />
    </div>
  );
}
