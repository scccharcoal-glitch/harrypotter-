import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories } from "@/lib/services/categories";
import { getArticleBySlug, getArticlesBySlugs, getArticlesByCategorySlug } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";
import { StarRating } from "@/components/site/StarRating";
import { accentClasses } from "@/lib/accent";
import { formatThaiDate } from "@/lib/format-date";
import { getExternalLinkProps } from "@/lib/external-links";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "ไม่พบเรื่องนี้" };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    alternates: { canonical: `/title/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      url: `/title/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.coverImageUrl, alt: article.coverImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt,
      images: [article.coverImageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, article] = await Promise.all([getAllCategories(), getArticleBySlug(slug)]);

  if (!article) {
    notFound();
  }

  const [related, moreFromCategory] = await Promise.all([
    getArticlesBySlugs(article.relatedSlugs ?? []),
    getArticlesByCategorySlug(article.category.slug, 6),
  ]);
  const accent = accentClasses(article.category.accentColor);
  const suggestions = related.length > 0 ? related : moreFromCategory.filter((a) => a.slug !== article.slug);
  const watchHref = article.watchUrl || `/title/${article.slug}`;

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <section className="flex flex-col gap-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl shadow-black/10 sm:p-7 md:flex-row">
          <div className="relative aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-xl bg-[var(--surface-muted)] shadow-xl shadow-black/20 md:w-72">
            <Image src={article.coverImageUrl} alt={article.coverImageAlt} fill sizes="256px" className="object-cover" />
          </div>

          <div className="min-w-0 flex-1 py-1">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${accent.badge}`}>
              {article.category.name}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--ink)] md:text-4xl">{article.title}</h1>

            {article.rating > 0 && (
              <div className="mt-2">
                <StarRating rating={article.rating} size="md" />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-muted)]">
              {article.episodeLabel && (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 font-semibold">
                  {article.episodeLabel}
                </span>
              )}
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                {article.status === "completed" ? "ฉายแล้ว" : "กำลังฉาย"}
              </span>
              {article.studio && <span className="rounded-full border border-[var(--border)] px-3 py-1">สตูดิโอ: {article.studio}</span>}
              <span className="rounded-full border border-[var(--border)] px-3 py-1">
                อัปเดต {formatThaiDate(article.updatedAt ?? article.publishedAt)}
              </span>
            </div>

            <p className="mt-5 rounded-xl bg-[var(--surface-muted)] p-4 text-base leading-8 text-[var(--ink)]/90">
              {article.excerpt}
            </p>

            <a
              href={watchHref}
              {...getExternalLinkProps(watchHref)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]"
            >
              <span aria-hidden="true">▶</span>
              ดู {article.title}
            </a>

            {article.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    prefetch={false}
                    className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-5 border-t border-[var(--border)] pt-4 text-sm text-[var(--ink-muted)]">
              ข้อมูลโดย {article.author.name}
            </p>
          </div>
        </section>

        {article.bodyHtml && (
          <section className="mx-auto mt-10 max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-9">
            <div className="mb-6 flex items-center gap-3 border-b border-[var(--border)] pb-5">
              <span className="h-7 w-1 rounded-full bg-[var(--brand)]" aria-hidden="true" />
              <p className="font-bold text-[var(--ink)]">รายละเอียดและเรื่องย่อ</p>
            </div>
            <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.bodyHtml) }} />
          </section>
        )}

        {suggestions.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 border-l-4 border-[var(--brand)] pl-3 text-lg font-bold text-[var(--ink)]">
              เรื่องที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {suggestions.slice(0, 6).map((item) => (
                <PosterCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
