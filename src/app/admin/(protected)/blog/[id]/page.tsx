import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { BlogPostForm, type BlogPostFormValue } from "../BlogPostForm";
import { updateBlogPost } from "../actions";

export const metadata: Metadata = {
  title: "แก้ไขบทความ",
  robots: { index: false, follow: false },
};

function formatDateInput(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) notFound();

  const value: BlogPostFormValue = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    bodyHtml: post.bodyHtml,
    coverImageUrl: post.coverImageUrl,
    coverImageAlt: post.coverImageAlt,
    category: post.category,
    tags: post.tags,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: formatDateInput(post.publishedAt),
    isPublished: post.isPublished,
  };

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-rose-600">บทความ</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">แก้ไขบทความ</h1>
      </div>
      <BlogPostForm
        action={updateBlogPost.bind(null, id)}
        post={value}
        blobEnabled={isBlobConfigured()}
      />
    </div>
  );
}
