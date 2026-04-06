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
  let loadError = false;
  try {
    conversations = await getUserConversations(user.id);
  } catch {
    loadError = true;
  }

  return (
    <PageBackground opacity={0.08}>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t("inbox.title")}
        </h1>
        <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-500 to-transparent" />
        <div className="mt-8">
          {loadError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center dark:border-red-500/30 dark:bg-red-500/[0.08]">
              <p className="font-medium text-gray-900 dark:text-white">
                {t("inbox.fetchFailed")}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-white/50">
                {t("inbox.fetchFailedDesc")}
              </p>
              <a
                href={`/${locale}/inbox`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25"
              >
                {t("common.retry")}
              </a>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              currentUserId={user.id}
              locale={locale}
            />
          )}
        </div>
      </main>
    </PageBackground>
  );
}
