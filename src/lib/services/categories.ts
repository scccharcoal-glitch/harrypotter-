import { prisma } from "@/lib/prisma";
import { Category } from "@/lib/types";
import { getStaticCategories, getStaticCategoryBySlug } from "@/lib/static-catalog";

// Runs during build-time static generation of "/" and "/latest" (and at
// request time everywhere else) — fail soft if the database is unreachable
// instead of taking down the whole page/build.
async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getAllCategories(): Promise<Category[]> {
  return withFallback(async () => {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return categories.length > 0 ? categories : getStaticCategories();
  }, getStaticCategories());
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return withFallback(async () => {
    const category = await prisma.category.findUnique({ where: { slug } });
    return category ?? getStaticCategoryBySlug(slug);
  }, getStaticCategoryBySlug(slug));
}
