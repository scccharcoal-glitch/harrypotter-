"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { getArticleBySlug } from "@/lib/services/articles";
import { getSiteUrl } from "@/lib/site-url";

const PLACEHOLDER_POSTER = "/placeholder-poster.svg";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Thai (and other non-Latin) titles slugify down to an empty/near-empty
// string since slugify() only keeps a-z0-9 — without this fallback, a Thai
// title with no manually-entered slug would silently produce a broken,
// unresolvable article URL.
function slugOrFallback(rawSlug: string, title: string): string {
  const fromSlug = slugify(rawSlug);
  if (fromSlug.length >= 3) return fromSlug;

  const fromTitle = slugify(title);
  if (fromTitle.length >= 3) return fromTitle;

  return `title-${Date.now()}`;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseRelatedSlugs(raw: string): string[] {
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function parseRating(raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

function parseWatchUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// If the cover-image field was given a URL to one of THIS site's own /title/[slug]
// pages (either a relative "/title/slug" path or an absolute URL on our own origin),
// return that slug so the calling code can look up and reuse that article's poster.
function extractInternalTitleSlug(value: string): string | null {
  if (value.startsWith("/title/")) {
    const slug = value.slice("/title/".length).split(/[?#]/)[0]?.trim();
    return slug || null;
  }

  try {
    const url = new URL(value);
    const siteOrigin = new URL(getSiteUrl()).origin;
    if (url.origin !== siteOrigin) return null;
    const match = url.pathname.match(/^\/title\/([^/]+)\/?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isUsableDirectUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Empty -> placeholder (article can still be posted with no image). A pasted URL to
// one of this site's own title pages -> reuse that article's cover image. Anything
// else that looks like a real http(s)/relative URL -> used as-is. Anything malformed
// -> placeholder rather than saving a broken image reference.
async function resolveCoverImage(raw: string): Promise<string> {
  const value = raw.trim();
  if (!value) return PLACEHOLDER_POSTER;

  const internalSlug = extractInternalTitleSlug(value);
  if (internalSlug) {
    const referenced = await getArticleBySlug(internalSlug);
    return referenced?.coverImageUrl || PLACEHOLDER_POSTER;
  }

  return isUsableDirectUrl(value) ? value : PLACEHOLDER_POSTER;
}

async function resolveCategoryId(rawCategoryId: string): Promise<string | null> {
  if (rawCategoryId) return rawCategoryId;
  const first = await prisma.category.findFirst({ orderBy: { sortOrder: "asc" } });
  return first?.id ?? null;
}

async function resolveAuthorId(rawAuthorId: string): Promise<string | null> {
  if (rawAuthorId) return rawAuthorId;
  const first = await prisma.author.findFirst({ orderBy: { name: "asc" } });
  return first?.id ?? null;
}

function readArticleFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugOrFallback(rawSlug, title),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    bodyHtml: sanitizeRichHtml(String(formData.get("bodyHtml") ?? "")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim(),
    coverImageAlt: String(formData.get("coverImageAlt") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    authorId: String(formData.get("authorId") ?? "").trim(),
    tags: parseTags(String(formData.get("tags") ?? "")),
    relatedSlugs: parseRelatedSlugs(String(formData.get("relatedSlugs") ?? "")),
    episodeLabel: String(formData.get("episodeLabel") ?? "").trim() || null,
    studio: String(formData.get("studio") ?? "").trim() || null,
    status: String(formData.get("status") ?? "ongoing"),
    rating: parseRating(String(formData.get("rating") ?? "0")),
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || null,
    watchUrl: parseWatchUrl(String(formData.get("watchUrl") ?? "")),
  };
}

// Only `title` is a hard requirement — everything else has a sensible fallback
// (see resolveCoverImage/resolveCategoryId/resolveAuthorId and the excerpt/
// coverImageAlt defaults below) so an admin can post with just a title filled in.
async function buildArticleData(
  formData: FormData
): Promise<{ error: string } | { data: ReturnType<typeof readArticleFields> & { categoryId: string; authorId: string; coverImageUrl: string } }> {
  const fields = readArticleFields(formData);

  if (!fields.title) {
    return { error: "กรุณากรอกชื่อเรื่อง" };
  }

  const [categoryId, authorId, coverImageUrl] = await Promise.all([
    resolveCategoryId(fields.categoryId),
    resolveAuthorId(fields.authorId),
    resolveCoverImage(fields.coverImageUrl),
  ]);

  if (!categoryId) {
    return { error: "ยังไม่มีหมวดหมู่ในระบบ กรุณาสร้างหมวดหมู่ก่อนเพิ่มเรื่อง" };
  }
  if (!authorId) {
    return { error: "ยังไม่มีผู้อัปโหลดในระบบ กรุณาสร้างผู้อัปโหลดก่อนเพิ่มเรื่อง" };
  }

  return {
    data: {
      ...fields,
      categoryId,
      authorId,
      coverImageUrl,
      excerpt: fields.excerpt || fields.title,
      coverImageAlt: fields.coverImageAlt || fields.title,
    },
  };
}

function revalidateArticlePages(slug: string) {
  revalidatePath("/");
  revalidatePath("/category/[slug]", "page");
  revalidatePath(`/title/${slug}`);
}

export async function createArticle(_prevState: { error?: string } | undefined, formData: FormData) {
  const result = await buildArticleData(formData);
  if ("error" in result) {
    return { error: result.error };
  }

  try {
    await prisma.article.create({ data: result.data });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมี slug นี้อยู่แล้ว" };
  }

  revalidateArticlePages(result.data.slug);
  redirect("/admin/articles");
}

export async function updateArticle(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const result = await buildArticleData(formData);
  if ("error" in result) {
    return { error: result.error };
  }

  try {
    await prisma.article.update({ where: { id }, data: result.data });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมี slug นี้อยู่แล้ว" };
  }

  revalidateArticlePages(result.data.slug);
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  const article = await prisma.article.delete({ where: { id } });
  revalidateArticlePages(article.slug);
  redirect("/admin/articles");
}
