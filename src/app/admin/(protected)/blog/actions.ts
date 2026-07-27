"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

const BLOG_PLACEHOLDER_IMAGE = "/placeholder-poster.svg";

function slugify(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
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

function revalidateBlogPages(slugs: string[]) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    revalidatePath(`/blog/${slug}`);
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
