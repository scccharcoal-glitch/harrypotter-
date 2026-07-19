"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function revalidateCategoryPages() {
  revalidatePath("/");
  revalidatePath("/category/[slug]", "page");
}

export async function createCategory(_prevState: { error?: string } | undefined, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "red");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const seoContent = sanitizeRichHtml(String(formData.get("seoContent") ?? "").trim());

  if (!name) {
    return { error: "กรุณากรอกชื่อหมวดหมู่" };
  }

  try {
    await prisma.category.create({
      data: { name, slug: rawSlug ? slugify(rawSlug) : slugify(name), accentColor, sortOrder, seoContent },
    });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมีชื่อหรือ slug นี้อยู่แล้ว" };
  }

  revalidateCategoryPages();
  return {};
}

export async function updateCategory(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "red");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const seoContent = sanitizeRichHtml(String(formData.get("seoContent") ?? "").trim());

  if (!name) {
    return { error: "กรุณากรอกชื่อหมวดหมู่" };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name, slug: rawSlug ? slugify(rawSlug) : slugify(name), accentColor, sortOrder, seoContent },
    });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมีชื่อหรือ slug นี้อยู่แล้ว" };
  }

  revalidateCategoryPages();
  return {};
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    // Likely still referenced by existing articles (categoryId is required
    // on Article) — silently no-op rather than crashing; the row stays.
    return;
  }
  revalidateCategoryPages();
}
