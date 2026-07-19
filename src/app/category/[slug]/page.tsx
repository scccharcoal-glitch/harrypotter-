import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug } from "@/lib/services/categories";
import { getArticlesByCategorySlug } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";
import { SeoContent } from "@/components/site/SeoContent";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const description = category?.seoContent.trim().replace(/\s+/g, " ").slice(0, 160);
  return {
    title: category?.name ?? "หมวดหมู่",
    description: description || undefined,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, category] = await Promise.all([getAllCategories(), getCategoryBySlug(slug)]);

  if (!category) {
    notFound();
  }

  const articles = await getArticlesByCategorySlug(slug, 500);

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--ink)]">{category.name}</h1>
        {articles.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">ยังไม่มีเรื่องในหมวดนี้</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {articles.map((article) => (
              <PosterCard key={article.id} article={article} />
            ))}
          </div>
        )}
        <SeoContent heading={`เกี่ยวกับ${category.name}`} content={category.seoContent} />
      </main>
      <Footer />
    </div>
  );
}
