"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

const BLOG_PLACEHOLDER_IMAGE = "/placeholder-poster.svg";

function slugify(value: string): string {
  // ASCII-only on purpose (not \p{Letter}, which matches Thai script too): the slug ends up
  // in revalidatePath() and, from there, an HTTP response header, and header values must be
  // ByteString (Latin-1) — a Thai character throws "Cannot convert argument to a ByteString"
  // at request time. A title that's entirely Thai (the normal case here) correctly reduces to
  // "" below, which falls back to `post-${Date.now()}` in readBlogPostFields.
  return value
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function parsePublishedAt(raw: string): Date {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000+07:00`)
    : new Date();

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function normalizeCoverImage(value: string): string {
  const url = value.trim();
  if (!url) return BLOG_PLACEHOLDER_IMAGE;
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : BLOG_PLACEHOLDER_IMAGE;
  } catch {
    return BLOG_PLACEHOLDER_IMAGE;
  }
}

function readBlogPostFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(requestedSlug || title) || `post-${Date.now()}`;
  const excerpt = String(formData.get("excerpt") ?? "").trim();

  return {
    title,
    slug,
    excerpt: excerpt || title,
    bodyHtml: sanitizeRichHtml(String(formData.get("bodyHtml") ?? "")),
    coverImageUrl: normalizeCoverImage(String(formData.get("coverImageUrl") ?? "")),
    coverImageAlt: String(formData.get("coverImageAlt") ?? "").trim() || title,
    category: String(formData.get("category") ?? "").trim() || "บทความ",
    tags: parseTags(String(formData.get("tags") ?? "")),
    seoTitle: String(formData.get("seoTitle") ?? "").trim() || null,
    seoDescription: String(formData.get("seoDescription") ?? "").trim() || excerpt || title,
    publishedAt: parsePublishedAt(String(formData.get("publishedAt") ?? "")),
    isPublished: formData.get("isPublished") === "on",
  };
}

function validateBlogPost(fields: ReturnType<typeof readBlogPostFields>): string | null {
  if (!fields.title) return "กรุณากรอกชื่อบทความ";
  if (fields.slug.length < 3) return "Slug ต้องมีอย่างน้อย 3 ตัวอักษร";
  if (fields.isPublished && !fields.bodyHtml.trim()) return "กรุณาเขียนเนื้อหาก่อนเผยแพร่บทความ";
  return null;
}

// Defense in depth: slugify() only ever produces ASCII now, but `slugs` here can include a
// post's *previous* slug fetched straight from the database — including any row saved before
// that fix existed. revalidatePath() ends up passing the path through as an HTTP header value
// (ByteString/Latin-1 only), so a leftover non-ASCII slug would crash the whole save instead of
// just skipping a cache revalidation that wasn't reachable in a normal way anyway.
function isSafeRevalidateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

function revalidateBlogPages(slugs: string[]) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    if (isSafeRevalidateSlug(slug)) revalidatePath(`/blog/${slug}`);
  }
}

export async function createBlogPost(
  _previousState: { error?: string } | undefined,
  formData: FormData
) {
  const fields = readBlogPostFields(formData);
  const error = validateBlogPost(fields);
  if (error) return { error };

  try {
    await prisma.blogPost.create({ data: fields });
  } catch {
    return { error: "บันทึกไม่สำเร็จ อาจมี Slug นี้อยู่แล้ว" };
  }

  revalidateBlogPages([fields.slug]);
  redirect("/admin/blog");
}

export async function updateBlogPost(
  id: string,
  _previousState: { error?: string } | undefined,
  formData: FormData
) {
  const fields = readBlogPostFields(formData);
  const error = validateBlogPost(fields);
  if (error) return { error };

  const previous = await prisma.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!previous) return { error: "ไม่พบบทความนี้" };

  try {
    await prisma.blogPost.update({ where: { id }, data: fields });
  } catch {
    return { error: "บันทึกไม่สำเร็จ อาจมี Slug นี้อยู่แล้ว" };
  }

  revalidateBlogPages([previous.slug, fields.slug]);
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  const post = await prisma.blogPost.delete({
    where: { id },
    select: { slug: true },
  });
  revalidateBlogPages([post.slug]);
  redirect("/admin/blog");
}
