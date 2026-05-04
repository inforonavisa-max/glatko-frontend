import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PortableText } from "@/components/sanity/PortableText";
import { getAllPostSlugs, getPostBySlug } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { SEO_BASE, SEO_LOCALES, hreflangForLocale } from "@/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string };
}

export async function generateStaticParams() {
  // Pre-render the ME slug set; other locales get on-demand ISR. ME is
  // the primary content language so this covers most cold-cache traffic.
  const slugs = await getAllPostSlugs("me").catch(() => []);
  return slugs
    .filter((s) => s.slug)
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) return {};

  const post = await getPostBySlug(slug, locale).catch(() => null);
  if (!post) return { robots: { index: false } };

  const title = post.seo?.metaTitle ?? post.title;
  const description = post.seo?.metaDescription ?? post.excerpt;

  const ogImageSrc = post.seo?.ogImage?.asset
    ? urlFor(post.seo.ogImage).width(1200).height(630).url()
    : post.coverImage?.asset
      ? urlFor(post.coverImage).width(1200).height(630).url()
      : undefined;

  // Build hreflang only for locales that have content for this article;
  // sending hreflang for empty translations would mislead crawlers.
  // (Day 1 ships ME-only, so the others fall back to the canonical.)
  const languages: Record<string, string> = {};
  for (const l of SEO_LOCALES) {
    languages[hreflangForLocale(l)] = `${SEO_BASE}/${l}/blog/${slug}`;
  }
  languages["x-default"] = `${SEO_BASE}/en/blog/${slug}`;

  return {
    title: `${title} | Glatko`,
    description,
    alternates: {
      canonical: `${SEO_BASE}/${locale}/blog/${slug}`,
      languages,
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: `${SEO_BASE}/${locale}/blog/${slug}`,
      siteName: "Glatko",
      type: "article",
      publishedTime: post.publishedAt,
      images: ogImageSrc ? [{ url: ogImageSrc, width: 1200, height: 630 }] : [],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: ogImageSrc ? [ogImageSrc] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await Promise.resolve(params);
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, locale).catch(() => null);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
      >
        ← {locale === "tr" ? "Tüm makaleler" : locale === "en" ? "All articles" : "Svi članci"}
      </Link>

      <header className="mt-4 mb-8">
        {post.category ? (
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            {post.category.title}
          </div>
        ) : null}
        <h1 className="font-serif text-3xl font-semibold leading-tight text-gray-900 dark:text-white md:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-white/60">
          {post.author?.avatar?.asset ? (
            <Image
              src={urlFor(post.author.avatar).width(48).height(48).url()}
              alt={post.author.name ?? ""}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : null}
          {post.author?.name ? (
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </div>
              {post.author.role ? (
                <div className="text-xs text-gray-500 dark:text-white/50">
                  {post.author.role}
                </div>
              ) : null}
            </div>
          ) : null}
          <time
            dateTime={post.publishedAt}
            className="ml-auto text-xs text-gray-500 dark:text-white/50"
          >
            {new Date(post.publishedAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </header>

      {post.coverImage?.asset ? (
        <figure className="mb-10 overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/[0.08]">
          <Image
            src={urlFor(post.coverImage).width(1600).url()}
            alt={post.coverImage.alt ?? post.title}
            width={1600}
            height={900}
            className="h-auto w-full"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </figure>
      ) : null}

      <PortableText value={post.content} />

      {post.tags && post.tags.length > 0 ? (
        <footer className="mt-12 border-t border-gray-200/70 pt-6 dark:border-white/[0.08]">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.slug}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-white/[0.06] dark:text-white/70"
              >
                #{tag.title}
              </span>
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  );
}
