import type { Metadata } from "next";
import { getAllCategories } from "@/lib/services/categories";
import { getCachedSiteSettings } from "@/lib/services/settings";
import { getArticlesByCategorySlug } from "@/lib/services/articles";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PosterCard } from "@/components/site/PosterCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { SeoContent } from "@/components/site/SeoContent";

export const revalidate = 60;
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, settings] = await Promise.all([getAllCategories(), getCachedSiteSettings()]);

  const homeCategories = categories.filter((category) => settings.homeCategorySlugs.includes(category.slug));

  // Oldest-to-newest per category (ภาค 1 → ภาค 8) — this is a small, fixed film saga, not a
  // rolling content feed, so a "latest updates" section doesn't apply here.
  const categorySections = await Promise.all(
    homeCategories.map(async (category) => ({
      category,
      articles: await getArticlesByCategorySlug(category.slug, 20),
    }))
  );

  return (
    <div className="flex min-h-full flex-col">
      <Header categories={categories} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--ink)] md:text-2xl">
          ดูแฮร์รี่พอตเตอร์ ข้อมูลหนัง Harry Potter ครบทุกภาค พากย์ไทย ซับไทย เต็มเรื่อง
        </h1>

        {categorySections.map(
          ({ category, articles }) =>
            articles.length > 0 && (
              <section key={category.id} className="mb-10">
                <SectionHeader
                  title={category.name}
                  href={`/category/${category.slug}`}
                  accentColor={category.accentColor}
                />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {articles.map((article) => (
                    <PosterCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )
        )}

        {categorySections.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--ink-muted)]">
            ยังไม่ได้เลือกหมวดหมู่แสดงบนหน้าแรก ไปตั้งค่าได้ที่ /admin/settings
          </p>
        )}

        <SeoContent heading="เกี่ยวกับดูแฮร์รี่พอตเตอร์" content={settings.homeSeoContent} />
      </main>

      <Footer />
    </div>
  );
}
