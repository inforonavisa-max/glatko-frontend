import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { setRequestLocale } from "next-intl/server";

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      {children}
    </div>
  );
}
