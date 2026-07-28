import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { formatThaiDate } from "@/lib/format-date";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from "@/lib/services/blog-posts";
import { getAllCategories } from "@/lib/services/categories";
import { getSiteUrl } from "@/lib/site-url";
import { isAllowedImageHost } from "@/lib/image-host";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "ไม่พบบทความ" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: [{ url: post.coverImageUrl, alt: post.coverImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, post, latestPosts] = await Promise.all([
    getAllCategories(),
    getPublishedBlogPostBySlug(slug),
    getPublishedBlogPosts(4),
  ]);

  if (!post) notFound();

  const related = latestPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: new URL(post.coverImageUrl, getSiteUrl()).toString(),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${getSiteUrl()}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "ดูแฮร์รี่พอตเตอร์",
      url: getSiteUrl(),
    },
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        <article>
          <header className="mx-auto max-w-4xl px-4 pb-8 pt-10 text-center sm:pt-14">
            <Link
              href="/blog"
              prefetch={false}
              className="inline-flex items-center rounded-full bg-[var(--brand)]/15 px-3 py-1.5 text-xs font-bold text-[var(--brand)]"
            >
              {post.category}
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-[var(--ink)] sm:text-5xl">{post.title}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--ink-muted)] sm:text-lg">{post.excerpt}</p>
            <time className="mt-5 block text-sm text-[var(--ink-muted)]" dateTime={post.publishedAt}>
              เผยแพร่เมื่อ {formatThaiDate(post.publishedAt)}
            </time>
          </header>

          <div className="mx-auto max-w-5xl px-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
              {isAllowedImageHost(post.coverImageUrl) ? (
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              ) : (
                // arbitrary admin-entered external host, not covered by next/image's allowlist
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt={post.coverImageAlt} className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
          </div>

          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
            <div
              className="article-content rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.bodyHtml) }}
            />

            {post.tags.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--ink-muted)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-[var(--border)] bg-[var(--surface)]/40">
            <div className="mx-auto max-w-6xl px-4 py-10">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold text-[var(--ink)]">บทความล่าสุด</h2>
                <Link href="/blog" prefetch={false} className="text-sm font-bold text-[var(--brand)] hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    prefetch={false}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--brand)]/60"
                  >
                    <p className="text-xs font-semibold text-[var(--brand)]">{item.category}</p>
                    <h3 className="mt-2 font-bold leading-6 text-[var(--ink)]">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </main>
      <Footer />
    </div>
  );
}
