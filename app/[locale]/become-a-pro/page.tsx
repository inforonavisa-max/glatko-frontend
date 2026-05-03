import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { BecomeAProWizard } from "@/components/glatko/become-a-pro/BecomeAProWizard";
import { GlatkoBentoImages } from "@/components/glatko/landing/BentoImagesGrid";
import { NoiseCTA } from "@/components/glatko/landing/NoiseCTA";
import { PageBackground } from "@/components/ui/PageBackground";

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
    .maybeSingle();

  const { data: accountProfile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch BOTH roots and sub-categories. StepServiceAreas splits them itself
  // (`parents` = roots, `childrenOf(parentId)` = subs of a given root); the
  // per-card expansion only renders sub-checkboxes — there is nothing else
  // to click to make a selection. Filtering this query to roots only made
  // every parent card a no-op (expansion empty / no children), so clicks
  // looked dead and step 2 was unreachable. Bug shipped unnoticed because
  // founding pros completed signup before sub-categories landed in migration
  // 038 (G-CAT-6 expansion).
  const { data: categories } = await supabase
    .from("glatko_service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const t = await getTranslations();

  if (existingPro) {
    return (
      <PageBackground opacity={0.12}>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-semibold text-gray-900 dark:text-white">
              {t("pro.wizard.alreadyPro")}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-white/50">
              {t("pro.wizard.successDesc")}
            </p>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground opacity={0.1}>
      {/* G-UX-1: form üstte, ikna materyali altta. Kullanıcı bu sayfaya
          zaten "pro ol" demek için geldi; "neden Glatko" alttan referans
          rolünde kalsın. */}
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6">
        <BecomeAProWizard
          userId={user.id}
          categories={
            (categories ?? []) as import("@/types/glatko").ServiceCategory[]
          }
          userEmail={user.email ?? ""}
          displayName={accountProfile?.full_name ?? null}
          initialAvatarUrl={accountProfile?.avatar_url ?? null}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <GlatkoBentoImages
          title={t("becomePro.whyJoin.title")}
          card1Title={t("becomePro.whyJoin.card1")}
          card1Desc={t("becomePro.whyJoin.card1Desc")}
          card2Title={t("becomePro.whyJoin.card2")}
          card2Desc={t("becomePro.whyJoin.card2Desc")}
          card3Title={t("becomePro.whyJoin.card3")}
          card3Desc={t("becomePro.whyJoin.card3Desc")}
          card4Title={t("becomePro.whyJoin.card4")}
          card4Desc={t("becomePro.whyJoin.card4Desc")}
        />
      </div>
      <NoiseCTA
        title={t("landing.cta.proTitle")}
        subtitle={t("landing.cta.proSubtitle")}
        buttonText={t("landing.cta.proFooterBtn")}
        buttonHref="/become-a-pro"
      />
    </PageBackground>
  );
}
