import catalog from "@/lib/static-catalog.json";
import type { Article, ArticleSummary, Category } from "@/lib/types";
import type { SiteSettings, SponsorLink } from "@/lib/services/settings";

type StaticArticle = (typeof catalog.articles)[number];

function parseStringArray(value: string | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseSponsorLinks(value: string | undefined): SponsorLink[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const link = item as Record<string, unknown>;
      const label = typeof link.label === "string" ? link.label.trim() : "";
      const url = typeof link.url === "string" ? link.url.trim() : "";
      return label && url ? [{ label, url }] : [];
    });
  } catch {
    return [];
  }
}

function toCategory(row: (typeof catalog.categories)[number]): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    accentColor: row.accentColor,
    sortOrder: row.sortOrder,
    seoContent: row.seoContent,
  };
}

function toArticle(row: StaticArticle): Article {
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
    status: row.status as Article["status"],
    rating: row.rating,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    isFeatured: row.isFeatured,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    watchUrl: row.watchUrl,
    relatedSlugs: row.relatedSlugs,
    category: toCategory(row.category),
    author: {
      id: row.author.id,
      name: row.author.name,
      role: row.author.role,
      avatarUrl: row.author.avatarUrl,
      bio: row.author.bio,
    },
  };
}

function toArticleSummary(row: StaticArticle): ArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    coverImageUrl: row.coverImageUrl,
    coverImageAlt: row.coverImageAlt,
    publishedAt: row.publishedAt,
    episodeLabel: row.episodeLabel,
    rating: row.rating,
    category: {
      name: row.category.name,
      accentColor: row.category.accentColor,
    },
    author: {
      name: row.author.name,
    },
  };
}

export function getStaticCategories(): Category[] {
  return catalog.categories.map(toCategory);
}

export function getStaticCategoryBySlug(slug: string): Category | undefined {
  return getStaticCategories().find((category) => category.slug === slug);
}

export function getStaticFeaturedArticles(limit = 5): ArticleSummary[] {
  return catalog.articles.filter((article) => article.isFeatured).slice(0, limit).map(toArticleSummary);
}

export function getStaticLatestArticles(limit = 12): ArticleSummary[] {
  return catalog.articles.slice(0, limit).map(toArticleSummary);
}

export function getStaticArticlesByCategorySlug(slug: string, limit = 6): ArticleSummary[] {
  return catalog.articles
    .filter((article) => article.category.slug === slug)
    .slice(0, limit)
    .map(toArticleSummary);
}

export function getStaticArticleBySlug(slug: string): Article | undefined {
  const article = catalog.articles.find((row) => row.slug === slug);
  return article ? toArticle(article) : undefined;
}

export function getStaticArticlesBySlugs(slugs: string[]): ArticleSummary[] {
  const slugSet = new Set(slugs);
  return catalog.articles.filter((article) => slugSet.has(article.slug)).map(toArticleSummary);
}

export function getStaticArticleSlugs(): string[] {
  return catalog.articles.map((article) => article.slug);
}

export function getStaticSitemapArticles(): Array<{ slug: string; publishedAt: Date; updatedAt: Date }> {
  return catalog.articles.map((article) => ({
    slug: article.slug,
    publishedAt: new Date(article.publishedAt),
    updatedAt: new Date(article.updatedAt),
  }));
}

export function getStaticArticlesByTag(tag: string, limit = 60): ArticleSummary[] {
  return catalog.articles
    .filter((article) => article.tags.includes(tag))
    .slice(0, limit)
    .map(toArticleSummary);
}

export function getStaticArticlesBySearchQuery(query: string, limit = 60): ArticleSummary[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("th").slice(0, 100);
  if (!normalizedQuery) return [];

  return catalog.articles
    .filter((article) =>
      [article.title, article.excerpt, article.seoTitle ?? ""].some((value) =>
        value.toLocaleLowerCase("th").includes(normalizedQuery)
      )
    )
    .slice(0, limit)
    .map(toArticleSummary);
}

export function getStaticAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const article of catalog.articles) {
    for (const tag of article.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "th"));
}

export function getStaticSiteSettings(): SiteSettings {
  const settings = new Map(catalog.settings.map((setting) => [setting.key, setting.value]));

  return {
    siteTitle:
      settings.get("site_title") ?? "ดูแฮร์รี่พอตเตอร์ | ข้อมูลหนัง Harry Potter ครบทุกภาค พากย์ไทย ซับไทย",
    siteDescription:
      settings.get("site_description") ??
      "ดูแฮร์รี่พอตเตอร์ ศูนย์รวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์ครบทั้ง 8 ภาค และสัตว์มหัศจรรย์ 3 ภาค พร้อมเรื่องย่อ นักแสดง ตัวละคร และเรตติ้ง อัปเดตข้อมูลใหม่ทุกวัน",
    siteShareImage: settings.get("site_share_image") ?? "",
    homeCategorySlugs: parseStringArray(settings.get("home_category_slugs")),
    homeSeoContent: settings.get("home_seo_content") ?? "",
    sponsorLinks: parseSponsorLinks(settings.get("sponsor_links")),
  };
}
