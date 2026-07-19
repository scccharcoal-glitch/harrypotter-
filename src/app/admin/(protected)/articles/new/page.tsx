import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { ArticleForm } from "../ArticleForm";
import { createArticle } from "../actions";

export const metadata: Metadata = {
  title: "เพิ่มเรื่องใหม่",
  robots: { index: false, follow: false },
};

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">เพิ่มเรื่องใหม่</h1>
      <ArticleForm
        categories={categories}
        authors={authors}
        action={createArticle}
        blobEnabled={isBlobConfigured()}
      />
    </div>
  );
}
