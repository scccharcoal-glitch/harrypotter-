export interface Category {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  sortOrder: number;
  seoContent: string;
}

export interface Author {
  id: string;
  name: string;
  role?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export type ArticleStatus = "ongoing" | "completed";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: string;
  updatedAt?: string;
  author: Author;
  bodyHtml: string;
  tags: string[];
  episodeLabel?: string | null;
  studio?: string | null;
  status: ArticleStatus;
  rating: number;
  relatedSlugs?: string[];
  isFeatured?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  watchUrl?: string | null;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  category: Pick<Category, "name" | "accentColor">;
  coverImageUrl: string;
  coverImageAlt: string;
  publishedAt: string;
  author: Pick<Author, "name">;
  episodeLabel?: string | null;
  rating: number;
}
