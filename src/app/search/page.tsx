import type { Metadata } from "next";
import { getAllCategories } from "@/lib/services/categories";
import { getArticlesBySearchQuery } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";

export const metadata: Metadata = {
  title: "ค้นหาภาพยนตร์แฮร์รี่ พอตเตอร์",
  description: "ค้นหาข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์จากดูแฮร์รี่พอตเตอร์",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().slice(0, 100);
  const [categories, articles] = await Promise.all([
    getAllCategories(),
    query ? getArticlesBySearchQuery(query, 60) : Promise.resolve([]),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} searchQuery={query} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Search</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">
            {query ? `ผลการค้นหา “${query}”` : "ค้นหาภาพยนตร์แฮร์รี่ พอตเตอร์"}
          </h1>
          {query && (
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              พบ {articles.length} รายการ
            </p>
          )}
        </div>

        {!query ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-muted)]">
            พิมพ์ชื่อภาพยนตร์ในช่องค้นหาด้านบน
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="font-semibold text-[var(--ink)]">ยังไม่พบเรื่องที่ค้นหา</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">ลองใช้ชื่อเรื่องที่สั้นลง หรือค้นหาด้วยชื่อภาษาอังกฤษ</p>
          </div>
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
