import type { Metadata } from "next";
import { getAllCategories } from "@/lib/services/categories";
import { getArticlesByTag } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `แท็ก: ${decodedTag}`,
    description: `รวมภาพยนตร์แฮร์รี่ พอตเตอร์ในแท็ก ${decodedTag} พร้อมข้อมูล เรื่องย่อ และรายการอัปเดตล่าสุด`,
    alternates: { canonical: `/tag/${encodeURIComponent(decodedTag)}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const [categories, articles] = await Promise.all([getAllCategories(), getArticlesByTag(tag, 100)]);

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--ink)]">แท็ก: {tag}</h1>
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">ยังไม่มีเรื่องในแท็กนี้</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {articles.map((article) => (
              <PosterCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
