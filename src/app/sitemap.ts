import type { MetadataRoute } from "next";
import { getAllCategories } from "@/lib/services/categories";
import { getCachedAllTags, getSitemapArticles } from "@/lib/services/articles";
import { getSitemapBlogPosts } from "@/lib/services/blog-posts";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, blogPosts, categories, tags] = await Promise.all([
    getSitemapArticles(),
    getSitemapBlogPosts(),
    getAllCategories(),
    getCachedAllTags(),
  ]);

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/latest`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/characters`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/title/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: `${siteUrl}/tag/${encodeURIComponent(tag)}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
