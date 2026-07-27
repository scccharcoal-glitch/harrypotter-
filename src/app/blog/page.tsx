import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { formatThaiDate } from "@/lib/format-date";
import { getPublishedBlogPosts } from "@/lib/services/blog-posts";
import { getAllCategories } from "@/lib/services/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "บทความแฮร์รี่ พอตเตอร์",
  description: "บทความ เกร็ดความรู้ เบื้องหลัง และเรื่องราวน่าสนใจจากโลกของ Harry Potter",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "บทความแฮร์รี่ พอตเตอร์",
    description: "บทความ เกร็ดความรู้ เบื้องหลัง และเรื่องราวน่าสนใจจากโลกของ Harry Potter",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([getAllCategories(), getPublishedBlogPosts()]);

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <header className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand)]">Wizarding Journal</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[var(--ink)] sm:text-5xl">
            บทความแฮร์รี่ พอตเตอร์
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--ink-muted)]">
            เกร็ดความรู้ เบื้องหลังภาพยนตร์ ตัวละคร และเรื่องราวน่าสนใจจากโลกเวทมนตร์
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[var(--brand)]/60"
              >
                <Link href={`/blog/${post.slug}`} prefetch={false} className="block">
                  <div className="relative aspect-video overflow-hidden bg-[var(--surface-muted)]">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.coverImageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
                      <span className="rounded-full bg-[var(--brand)]/15 px-2.5 py-1 font-semibold text-[var(--brand)]">
                        {post.category}
                      </span>
                      <time dateTime={post.publishedAt}>{formatThaiDate(post.publishedAt)}</time>
                    </div>
                    <h2 className="mt-4 text-xl font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--brand)]">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--ink-muted)]">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
                      อ่านบทความ <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <p className="text-lg font-bold text-[var(--ink)]">กำลังเตรียมบทความใหม่</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">โปรดกลับมาเยี่ยมชมอีกครั้งเร็ว ๆ นี้</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
