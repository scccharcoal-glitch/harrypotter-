import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Article as PrismaArticle, Author, Category, Prisma } from "@prisma/client";
import type { Article, ArticleStatus, ArticleSummary } from "@/lib/types";
import {
  getStaticAllTags,
  getStaticArticleBySlug,
  getStaticArticleSlugs,
  getStaticArticlesByCategorySlug,
  getStaticArticlesBySearchQuery,
  getStaticArticlesBySlugs,
  getStaticArticlesByTag,
  getStaticFeaturedArticles,
  getStaticLatestArticles,
  getStaticSitemapArticles,
} from "@/lib/static-catalog";

type ArticleWithRelations = PrismaArticle & { category: Category; author: Author };

function toArticle(row: ArticleWithRelations): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    bodyHtml: row.bodyHtml,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    tags: row.tags,
    episodeLabel: row.episodeLabel,
    studio: row.studio,
    status: row.status as ArticleStatus,
    rating: row.rating,
    publishedAt: row.publishedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isFeatured: row.isFeatured,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    watchUrl: row.watchUrl,
    relatedSlugs: row.relatedSlugs,
    category: row.category,
    author: row.author,
  };
}

const include = { category: true, author: true } as const;
const summarySelect = {
  id: true,
  slug: true,
  title: true,
  coverImageUrl: true,
  coverImageAlt: true,
  publishedAt: true,
  episodeLabel: true,
  rating: true,
  category: { select: { name: true, accentColor: true } },
  author: { select: { name: true } },
} satisfies Prisma.ArticleSelect;

type ArticleSummaryRow = Prisma.ArticleGetPayload<{ select: typeof summarySelect }>;

function toArticleSummary(row: ArticleSummaryRow): ArticleSummary {
  return {
    ...row,
    publishedAt: row.publishedAt.toISOString(),
  };
}

// Every one of these runs during build-time static generation of "/" and
// "/latest" (and at request time everywhere else). If the database is
// unreachable — no production DATABASE_URL configured yet, or a transient
// outage — fail soft with the given fallback instead of taking down the
// whole page (or the whole build).
async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getFeaturedArticles(limit = 5): Promise<ArticleSummary[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({
      where: { isFeatured: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: summarySelect,
    });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticFeaturedArticles(limit);
  }, getStaticFeaturedArticles(limit));
}

export async function getLatestArticles(limit = 12): Promise<ArticleSummary[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: summarySelect,
    });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticLatestArticles(limit);
  }, getStaticLatestArticles(limit));
}

export async function getArticlesByCategorySlug(slug: string, limit = 6): Promise<ArticleSummary[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({
      where: { category: { slug } },
      // Oldest to newest — this catalog is a fixed film saga (ภาค 1 → ภาค 8), not a rolling
      // content feed, so release order reads more naturally than "newest first".
      orderBy: { publishedAt: "asc" },
      take: limit,
      select: summarySelect,
    });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticArticlesByCategorySlug(slug, limit);
  }, getStaticArticlesByCategorySlug(slug, limit));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return withFallback(async () => {
    const row = await prisma.article.findUnique({ where: { slug }, include });
    return row ? toArticle(row) : getStaticArticleBySlug(slug);
  }, getStaticArticleBySlug(slug));
}

export async function getArticlesBySlugs(slugs: string[]): Promise<ArticleSummary[]> {
  if (slugs.length === 0) return [];
  return withFallback(async () => {
    const rows = await prisma.article.findMany({ where: { slug: { in: slugs } }, select: summarySelect });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticArticlesBySlugs(slugs);
  }, getStaticArticlesBySlugs(slugs));
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({ select: { slug: true } });
    return rows.length > 0 ? rows.map((row) => row.slug) : getStaticArticleSlugs();
  }, getStaticArticleSlugs());
}

export async function getSitemapArticles(): Promise<
  Array<{ slug: string; publishedAt: Date; updatedAt: Date }>
> {
  return withFallback(
    async () => {
      const rows = await prisma.article.findMany({
        select: { slug: true, publishedAt: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      });
      return rows.length > 0 ? rows : getStaticSitemapArticles();
    },
    getStaticSitemapArticles()
  );
}

export async function getArticlesByTag(tag: string, limit = 60): Promise<ArticleSummary[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({
      where: { tags: { has: tag } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: summarySelect,
    });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticArticlesByTag(tag, limit);
  }, getStaticArticlesByTag(tag, limit));
}

export async function getArticlesBySearchQuery(query: string, limit = 60): Promise<ArticleSummary[]> {
  const normalizedQuery = query.trim().slice(0, 100);
  if (!normalizedQuery) {
    return [];
  }

  return withFallback(async () => {
    const rows = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: normalizedQuery, mode: "insensitive" } },
          { excerpt: { contains: normalizedQuery, mode: "insensitive" } },
          { seoTitle: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      select: summarySelect,
    });
    return rows.length > 0 ? rows.map(toArticleSummary) : getStaticArticlesBySearchQuery(query, limit);
  }, getStaticArticlesBySearchQuery(query, limit));
}

async function getAllTags(): Promise<string[]> {
  return withFallback(async () => {
    const rows = await prisma.article.findMany({ select: { tags: true } });
    if (rows.length === 0) {
      return getStaticAllTags();
    }

    const tagSet = new Set<string>();
    for (const row of rows) {
      for (const tag of row.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "th"));
  }, getStaticAllTags());
}

export const getCachedAllTags = unstable_cache(getAllTags, ["all-tags"], {
  revalidate: 300,
  tags: ["tags"],
});
