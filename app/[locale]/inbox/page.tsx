import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getUserConversations } from "@/lib/supabase/glatko.server";
import { getTranslations } from "next-intl/server";
import { ConversationList } from "@/components/glatko/inbox/ConversationList";
import { PageBackground } from "@/components/ui/PageBackground";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations();

  let conversations: Awaited<ReturnType<typeof getUserConversations>> = [];
  try {
    conversations = await getUserConversations(user.id);
  } catch {
    // empty
  }

  return (
    <PageBackground opacity={0.08}>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t("inbox.title")}
        </h1>
        <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
        <div className="mt-8">
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            locale={locale}
          />
        </div>
      </main>
    </PageBackground>
  );
}
