import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string;
  updatedAt: string;
};

export type BlogPostSummary = Omit<PublicBlogPost, "bodyHtml" | "seoTitle" | "seoDescription">;

function toPublicBlogPost(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date;
  updatedAt: Date;
}): PublicBlogPost {
  return {
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getPublishedBlogPosts(limit = 24): Promise<BlogPostSummary[]> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { isPublished: true, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        category: true,
        tags: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export const getPublishedBlogPostBySlug = cache(async (slug: string): Promise<PublicBlogPost | null> => {
  try {
    const row = await prisma.blogPost.findFirst({
      where: {
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
    });

    return row ? toPublicBlogPost(row) : null;
  } catch {
    return null;
  }
});

export async function getSitemapBlogPosts(): Promise<Array<{ slug: string; publishedAt: Date; updatedAt: Date }>> {
  try {
    return await prisma.blogPost.findMany({
      where: { isPublished: true, publishedAt: { lte: new Date() } },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}
