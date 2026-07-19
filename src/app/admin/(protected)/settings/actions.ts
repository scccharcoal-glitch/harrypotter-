"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { updateSiteSettings } from "@/lib/services/settings";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";
import { prisma } from "@/lib/prisma";

function parseSponsorLinks(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => {
      const separatorIndex = line.indexOf("|");
      if (separatorIndex < 0) {
        return null;
      }

      const label = line.slice(0, separatorIndex).trim();
      const url = line.slice(separatorIndex + 1).trim();
      if (!label || !url) {
        return null;
      }

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          return null;
        }
      } catch {
        return null;
      }

      return { label, url };
    })
    .filter((link): link is { label: string; url: string } => link !== null);
}

export async function saveSiteSettings(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const siteDescription = String(formData.get("siteDescription") ?? "").trim();
  const siteShareImage = String(formData.get("siteShareImage") ?? "").trim();
  const homeSeoContent = sanitizeRichHtml(String(formData.get("homeSeoContent") ?? "").trim());
  const sponsorLinks = parseSponsorLinks(String(formData.get("sponsorLinks") ?? ""));
  const homeCategorySlugs = formData
    .getAll("homeCategorySlugs")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const categorySeoUpdates = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("categorySeoContent:"))
    .map(([key, value]) => ({
      id: key.slice("categorySeoContent:".length),
      seoContent: sanitizeRichHtml(String(value).trim()),
    }))
    .filter((item) => item.id);

  if (!siteTitle || !siteDescription) {
    return { error: "กรุณากรอก Site Title และ Description" };
  }

  if (homeCategorySlugs.length === 0) {
    return { error: "กรุณาเลือกหมวดที่จะแสดงบนหน้า Home อย่างน้อย 1 หมวด" };
  }

  await Promise.all([
    updateSiteSettings({
      siteTitle,
      siteDescription,
      siteShareImage,
      homeCategorySlugs,
      homeSeoContent,
      sponsorLinks,
    }),
    categorySeoUpdates.length > 0
      ? prisma.$transaction(
          categorySeoUpdates.map((item) =>
            prisma.category.update({
              where: { id: item.id },
              data: { seoContent: item.seoContent },
            })
          )
        )
      : Promise.resolve(),
  ]);
  revalidateTag("site-settings");
  revalidatePath("/", "layout");
  revalidatePath("/category/[slug]", "page");
  return { success: true };
}
