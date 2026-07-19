import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStaticSiteSettings } from "@/lib/static-catalog";

export const DEFAULT_SITE_TITLE =
  "ดูแฮร์รี่พอตเตอร์ | ข้อมูลหนัง Harry Potter ครบทุกภาค พากย์ไทย ซับไทย";
export const DEFAULT_SITE_DESCRIPTION =
  "ดูแฮร์รี่พอตเตอร์ ศูนย์รวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์ครบทั้ง 8 ภาค และสัตว์มหัศจรรย์ 3 ภาค พร้อมเรื่องย่อ นักแสดง ตัวละคร และเรตติ้ง อัปเดตข้อมูลใหม่ทุกวัน";
export const DEFAULT_SITE_SHARE_IMAGE = "";
export const DEFAULT_HOME_CATEGORY_SLUGS: string[] = [];
export const DEFAULT_HOME_SEO_CONTENT = "";
export const DEFAULT_SPONSOR_LINKS: SponsorLink[] = [];

export interface SponsorLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteShareImage: string;
  homeCategorySlugs: string[];
  homeSeoContent: string;
  sponsorLinks: SponsorLink[];
}

function parseStringArray(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseSponsorLinks(value: string | undefined): SponsorLink[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const link = item as Record<string, unknown>;
      const label = typeof link.label === "string" ? link.label.trim() : "";
      const url = typeof link.url === "string" ? link.url.trim() : "";
      return label && url ? [{ label, url }] : [];
    });
  } catch {
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  // Runs from generateMetadata() on every route, including the build-time
  // prerender of /_not-found — if the database is unreachable at build time
  // (e.g. no production DATABASE_URL configured yet), fall back to defaults
  // instead of failing the whole build.
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "site_title",
            "site_description",
            "site_share_image",
            "home_category_slugs",
            "home_seo_content",
            "sponsor_links",
          ],
        },
      },
    });
    if (rows.length === 0) {
      return getStaticSiteSettings();
    }

    const map = new Map(rows.map((row) => [row.key, row.value]));

    return {
      siteTitle: map.get("site_title") ?? DEFAULT_SITE_TITLE,
      siteDescription: map.get("site_description") ?? DEFAULT_SITE_DESCRIPTION,
      siteShareImage: map.get("site_share_image") ?? DEFAULT_SITE_SHARE_IMAGE,
      homeCategorySlugs: parseStringArray(map.get("home_category_slugs")),
      homeSeoContent: map.get("home_seo_content") ?? DEFAULT_HOME_SEO_CONTENT,
      sponsorLinks: parseSponsorLinks(map.get("sponsor_links")),
    };
  } catch {
    return getStaticSiteSettings();
  }
}

export const getCachedSiteSettings = unstable_cache(getSiteSettings, ["site-settings"], {
  revalidate: 300,
  tags: ["site-settings"],
});

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "site_title" },
      update: { value: settings.siteTitle },
      create: { key: "site_title", value: settings.siteTitle },
    }),
    prisma.siteSetting.upsert({
      where: { key: "site_description" },
      update: { value: settings.siteDescription },
      create: { key: "site_description", value: settings.siteDescription },
    }),
    prisma.siteSetting.upsert({
      where: { key: "site_share_image" },
      update: { value: settings.siteShareImage },
      create: { key: "site_share_image", value: settings.siteShareImage },
    }),
    prisma.siteSetting.upsert({
      where: { key: "home_category_slugs" },
      update: { value: JSON.stringify(settings.homeCategorySlugs) },
      create: { key: "home_category_slugs", value: JSON.stringify(settings.homeCategorySlugs) },
    }),
    prisma.siteSetting.upsert({
      where: { key: "home_seo_content" },
      update: { value: settings.homeSeoContent },
      create: { key: "home_seo_content", value: settings.homeSeoContent },
    }),
    prisma.siteSetting.upsert({
      where: { key: "sponsor_links" },
      update: { value: JSON.stringify(settings.sponsorLinks) },
      create: { key: "sponsor_links", value: JSON.stringify(settings.sponsorLinks) },
    }),
  ]);
}
