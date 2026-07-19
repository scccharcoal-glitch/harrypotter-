import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { ArticleForm } from "../ArticleForm";
import { updateArticle } from "../actions";

export const metadata: Metadata = {
  title: "แก้ไขเรื่อง",
  robots: { index: false, follow: false },
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { category: true, author: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) {
    notFound();
  }

  const formArticle = {
    ...article,
    publishedAt: article.publishedAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    status: article.status as "ongoing" | "completed",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">แก้ไขเรื่อง</h1>
      <ArticleForm
        categories={categories}
        authors={authors}
        article={formArticle}
        action={updateArticle.bind(null, id)}
        blobEnabled={isBlobConfigured()}
      />
    </div>
  );
}
