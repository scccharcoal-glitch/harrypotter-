import type { Metadata } from "next";
import { getAllCategories } from "@/lib/services/categories";
import { getLatestArticles } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";

export const metadata: Metadata = {
  title: "อัปเดตล่าสุด",
  description: "รวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์ที่อัปเดตล่าสุด พร้อมเรื่องย่อ เรตติ้ง และรายละเอียดครบถ้วน",
  alternates: { canonical: "/latest" },
};
export const revalidate = 60;

export default async function LatestPage() {
  const [categories, articles] = await Promise.all([getAllCategories(), getLatestArticles(30)]);

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--ink)]">อัปเดตล่าสุด</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {articles.map((article) => (
            <PosterCard key={article.id} article={article} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
