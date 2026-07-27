import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteBlogPostButton } from "./DeleteBlogPostButton";

export const metadata: Metadata = {
  title: "บทความ",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      publishedAt: true,
      isPublished: true,
    },
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">บทความ</h1>
          <p className="mt-1 text-sm text-slate-500">สร้างและจัดการบทความความรู้เพื่อสนับสนุนเว็บไซต์</p>
        </div>
        <Link
          href="/admin/blog/new"
          prefetch={false}
          className="inline-flex justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          + เขียนบทความใหม่
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {posts.map((post) => (
          <article
            key={post.id}
            className="grid gap-4 border-b border-slate-200 p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
          >
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">{post.title}</h2>
              <p className="mt-1 truncate text-sm text-slate-500">/blog/{post.slug}</p>
              <p className="mt-1 text-xs text-slate-400">
                {post.isPublished ? "เผยแพร่แล้ว" : "ฉบับร่าง"} · {post.category}
              </p>
            </div>
            <time className="text-sm text-slate-500" dateTime={post.publishedAt.toISOString()}>
              {new Intl.DateTimeFormat("th-TH", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              }).format(post.publishedAt)}
            </time>
            <div className="flex items-center gap-4 md:justify-end">
              {post.isPublished && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                >
                  ดูหน้าเว็บ
                </Link>
              )}
              <Link
                href={`/admin/blog/${post.id}`}
                prefetch={false}
                className="font-semibold text-rose-600 underline decoration-rose-300 underline-offset-4 hover:text-rose-700"
              >
                แก้ไข
              </Link>
              <DeleteBlogPostButton id={post.id} title={post.title} />
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            ยังไม่มีบทความ กด “เขียนบทความใหม่” เพื่อเริ่มต้น
          </div>
        )}
      </div>
    </div>
  );
}
