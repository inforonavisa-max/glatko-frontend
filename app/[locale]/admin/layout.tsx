import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { PageBackground } from "@/components/ui/PageBackground";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/admin/professionals`);
  }

  return (
    <PageBackground opacity={0.06}>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        {children}
      </div>
    </PageBackground>
  );
}
