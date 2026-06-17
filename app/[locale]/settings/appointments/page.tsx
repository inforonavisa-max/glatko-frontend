import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/supabase/server";
import { PageBackground } from "@/components/ui/PageBackground";
import { isHealthVerticalEnabled } from "@/lib/saglik/flags";
import { listUserAppointments, type UserAppointment } from "@/lib/saglik/booking";
import { UserAppointmentsList } from "@/components/glatko-saglik/UserAppointmentsList";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("healthVertical.account.title") };
}

// Always per-request (live appointment status) + noindex (inherited from layout).
export const dynamic = "force-dynamic";

export default async function AppointmentsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations();

  // Auth-gated (same pattern as the other settings tabs).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login?redirect=/settings/appointments`);
  }

  // Health-specific data is flag-gated: when the vertical is off (or the user has no
  // linked patient row yet) the list is simply empty — never a crash, never a 404.
  let appointments: UserAppointment[] = [];
  if (isHealthVerticalEnabled()) {
    try {
      appointments = await listUserAppointments(user.id, l);
    } catch {
      // A read-RPC hiccup degrades to an empty list (the account page must still render).
      appointments = [];
    }
  }

  return (
    <PageBackground opacity={0.08}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-light tracking-tight text-gray-900 dark:text-white">
          {t("healthVertical.account.title")}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
          {t("healthVertical.account.subtitle")}
        </p>
        <div className="mt-8">
          <UserAppointmentsList appointments={appointments} locale={l} />
        </div>
      </div>
    </PageBackground>
  );
}
