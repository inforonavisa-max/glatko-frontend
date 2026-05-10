import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getAllPosts } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";

/**
 * Homepage "Latest from our blog" section. Server-rendered: pulls the
 * top-3 most recent posts (per current locale) from Sanity. Surfaces
 * blog content into the homepage so articles aren't orphans for
 * crawlers, and gives organic traffic a clear next step.
 */
export async function LatestBlogPosts({ locale }: { locale: string }) {
  const posts = await getAllPosts(locale).catch(() => []);
  if (posts.length === 0) return null;

  const top = posts.slice(0, 3);

  return <LatestBlogPostsView posts={top} locale={locale} />;
}

function LatestBlogPostsView({
  posts,
  locale,
}: {
  posts: Awaited<ReturnType<typeof getAllPosts>>;
  locale: string;
}) {
  const t = useTranslations();
  return (
    <section className="px-4 py-20 md:py-24" aria-labelledby="latest-blog-title">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2
            id="latest-blog-title"
            className="font-serif text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl"
          >
            {t("blogTeaser.title")}
          </h2>
          <Link
            href="/blog"
            className="hidden shrink-0 text-sm font-semibold text-teal-700 transition hover:underline dark:text-teal-300 sm:inline-flex"
          >
            {t("blogTeaser.viewAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
              className="group block overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 backdrop-blur-sm transition-all hover:border-teal-500/30 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              {post.coverImage?.asset ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={urlFor(post.coverImage).width(800).height(450).url()}
                    alt={post.coverImage.alt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : null}
              <div className="p-6">
                {post.category ? (
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {post.category.title}
                  </div>
                ) : null}
                <h3 className="font-serif text-xl font-semibold text-gray-900 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-white/60">
                    {post.excerpt}
                  </p>
                ) : null}
                <div className="mt-4 text-xs text-gray-500 dark:text-white/50">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(locale)}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-6 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 dark:border-teal-500/30 dark:bg-white/5 dark:text-teal-300 dark:hover:bg-teal-500/10"
          >
            {t("blogTeaser.viewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
