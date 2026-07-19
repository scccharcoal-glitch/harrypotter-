import { PrismaClient } from "@prisma/client";
import { fetchCollectionParts, fetchGenreMap, tmdbPosterUrl, type TmdbResult } from "../src/lib/tmdb";

const prisma = new PrismaClient();

// TMDB collection ids — verified live via /search/collection before hardcoding
// (see tmdb-catalog-site skill's category-recipe.md for the general pattern).
const HARRY_POTTER_COLLECTION = 1241; // "Harry Potter Collection" — 8 parts
const FANTASTIC_BEASTS_COLLECTION = 435259; // "Fantastic Beasts Collection" — 3 parts

// This is a small, fixed-size franchise catalog (11 films total across both collections),
// unlike the anime/general-movie sites this scaffold was copied from — there's no discover
// pagination, no keyword filtering, and no "popularity" ranking needed. Every film in both
// TMDB collections is force-included via `collections`, and each one gets an explicit ภาค
// label below (TMDB's collection `parts` order isn't chronological, so this can't be derived
// by array position).
const EPISODE_LABEL_BY_TMDB_ID: Record<number, string> = {
  671: "ภาค 1: ศิลาอาถรรพ์",
  672: "ภาค 2: ห้องแห่งความลับ",
  673: "ภาค 3: นักโทษแห่งอัซคาบัน",
  674: "ภาค 4: ถ้วยอัคนี",
  675: "ภาค 5: ภาคีนกฟีนิกซ์",
  767: "ภาค 6: เจ้าชายเลือดผสม",
  12444: "ภาค 7.1: เครื่องรางยมทูต ตอนที่ 1",
  12445: "ภาค 7.2: เครื่องรางยมทูต ตอนที่ 2",
  259316: "ภาคแยก 1: สัตว์มหัศจรรย์และถิ่นที่อยู่",
  338952: "ภาคแยก 2: อาชญากรรมของกรินเดลวัลด์",
  338953: "ภาคแยก 3: ความลับของดัมเบิลดอร์",
};

// A handful of longtail search phrases (from the site's target keyword list) woven into each
// film's body copy as plain informational text — never as a "watch free" claim. Keeps the
// keyword targeting honest: this describes what the page contains (synopsis, cast, rating),
// not an offer to stream the film here.
const LONGTAIL_NOTE =
  "หน้านี้เป็นข้อมูลภาพยนตร์สำหรับแฟนคลับ Harry Potter ประกอบด้วยเรื่องย่อ นักแสดง และเรตติ้ง " +
  "หากต้องการรับชมฉบับเต็ม ทั้งพากย์ไทยและซับไทย กรุณาเลือกรับชมผ่านแพลตฟอร์มที่มีลิขสิทธิ์ถูกต้องเท่านั้น";

// Featured picks for the homepage hero (5 slots) — a representative spread across the saga
// (opener, fan-favorite third film, both finale parts) plus the Fantastic Beasts opener,
// rather than a popularity sort that would just return the same handful of finale films.
const FEATURED_TMDB_IDS = new Set([671, 673, 12444, 12445, 259316]);

interface CategoryDef {
  name: string;
  slug: string;
  accentColor: string;
  sortOrder: number;
  collectionId: number;
}

const CATEGORY_SEED: CategoryDef[] = [
  {
    name: "แฮร์รี่ พอตเตอร์ ทั้ง 8 ภาค",
    slug: "harry-potter",
    accentColor: "gold",
    sortOrder: 0,
    collectionId: HARRY_POTTER_COLLECTION,
  },
  {
    name: "สัตว์มหัศจรรย์ (Fantastic Beasts)",
    slug: "fantastic-beasts",
    accentColor: "green",
    sortOrder: 1,
    collectionId: FANTASTIC_BEASTS_COLLECTION,
  },
];

const HOME_CATEGORY_SLUGS = ["harry-potter", "fantastic-beasts"];

// Keyword-condensed intro paragraph for the homepage "เกี่ยวกับ" section — see the
// keyword-condensation skill for the method. Every target keyword phrase is covered via its
// component tokens (Google tokenizes and re-combines), never repeated verbatim back-to-back,
// and framed entirely around information (เรื่องย่อ/นักแสดง/ตัวละคร/เรตติ้ง) rather than
// access, per the tmdb-catalog-site skill's honest-copy rule — no "ดูฟรี" / "สตรีมมิ่ง" claims.
const HOME_SEO_CONTENT = `<p>ดูแฮร์รี่พอตเตอร์ (ดูแฮรี่ พอตเตอร์ / Harry Potter) ที่นี่คือแหล่งรวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์ครบทุกภาค ตั้งแต่แฮร์รี่ พอตเตอร์ภาค 1 กับศิลาอาถรรพ์ ภาค 2 กับห้องแห่งความลับ ภาค 3 กับนักโทษแห่งอัซคาบัน (Prisoner of Azkaban) ภาค 4 กับถ้วยอัคนี ภาค 5 กับภาคีนกฟีนิกซ์ ภาค 6 กับเจ้าชายเลือดผสม จนถึงภาค 7 กับเครื่องรางยมทูต ตอนที่ 2 รวมทุกภาคทั้งหมด 8 ภาค</p>
<p>เว็บไซต์นี้เป็นแหล่งข้อมูลสำหรับแฟนคลับ Harry Potter ทุกภาค พร้อมเรื่องย่อ นักแสดง ตัวละคร และเรตติ้งครบถ้วน เหมาะสำหรับผู้ที่สงสัยว่าแฮร์รี่ พอตเตอร์มีกี่ภาค ตัวละครในเรื่องมีใครบ้าง หรือกำลังค้นหาว่า harry potter ดูได้ที่ไหน ทั้งเวอร์ชันพากย์ไทยและซับไทยตามแพลตฟอร์มที่มีลิขสิทธิ์ถูกต้อง</p>
<p>ข้อมูลทั้งหมดอ้างอิงจากฐานข้อมูลภาพยนตร์สากล TMDB อัปเดตใหม่อยู่เสมอ ครบทั้งภาคหลักและภาคแยกสัตว์มหัศจรรย์ (Fantastic Beasts)</p>
<p>เลื่อนดูรายชื่อภาพยนตร์แฮร์รี่ พอตเตอร์ทุกภาคและตัวละครทั้งหมดได้ด้านบน</p>`;

const AUTHOR_SEED = [
  {
    name: "ทีมงานดูแฮร์รี่พอตเตอร์",
    role: "ทีมข้อมูล",
    bio: "รวบรวมข้อมูลภาพยนตร์แฮร์รี่ พอตเตอร์และสัตว์มหัศจรรย์จาก TMDB",
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function titleSlug(englishTitle: string, id: number): string {
  const base = slugify(englishTitle);
  return base ? `${base}-${id}` : `movie-${id}`;
}

async function fetchCollectionBothLanguages(
  collectionId: number
): Promise<{ thai: TmdbResult[]; englishTitleById: Map<number, string> }> {
  const [thai, english] = await Promise.all([
    fetchCollectionParts(collectionId, "th-TH"),
    fetchCollectionParts(collectionId, "en-US"),
  ]);
  return { thai, englishTitleById: new Map(english.map((item) => [item.id, item.title])) };
}

async function main() {
  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORY_SEED) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, accentColor: category.accentColor, sortOrder: category.sortOrder },
      create: {
        name: category.name,
        slug: category.slug,
        accentColor: category.accentColor,
        sortOrder: category.sortOrder,
      },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }

  const authorIds: string[] = [];
  for (const author of AUTHOR_SEED) {
    const row = await prisma.author.upsert({
      where: { name: author.name },
      update: author,
      create: author,
    });
    authorIds.push(row.id);
  }

  // One-time rebrand cleanup: reassign every existing article to the current author, then
  // drop any leftover author rows from a previous brand this project was forked from.
  await prisma.article.updateMany({ data: { authorId: authorIds[0] } });
  await prisma.author.deleteMany({ where: { name: { notIn: AUTHOR_SEED.map((author) => author.name) } } });

  const genreMap = await fetchGenreMap();
  // TMDB's own th-TH translation for genre id 12 ("Adventure") is truncated upstream
  // ("ผจญ" instead of "ผจญภัย") — verified live via /genre/movie/list?language=th-TH.
  // Override this one id rather than trusting the truncated translation.
  genreMap.set(12, "ผจญภัย");

  let articleIndex = 0;

  for (const category of CATEGORY_SEED) {
    const categoryId = categoryIdBySlug.get(category.slug);
    if (!categoryId) continue;

    const { thai: thaiResults, englishTitleById } = await fetchCollectionBothLanguages(category.collectionId);
    // Chronological order (release date ascending) — TMDB's `parts` array isn't sorted.
    thaiResults.sort((a, b) => (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""));

    for (const item of thaiResults) {
      const englishTitle = englishTitleById.get(item.id) ?? item.title;
      const slug = titleSlug(englishTitle, item.id);
      const overview = item.overview?.trim() || "ยังไม่มีเรื่องย่อสำหรับเรื่องนี้";
      const excerpt = overview.length > 160 ? `${overview.slice(0, 157)}...` : overview;
      const episodeLabel = EPISODE_LABEL_BY_TMDB_ID[item.id] ?? null;
      const tags = item.genreIds.map((id) => genreMap.get(id)).filter((name): name is string => Boolean(name));
      const rating = Math.round((item.voteAverage / 2) * 10) / 10;
      const coverImageUrl = tmdbPosterUrl(item.posterPath) ?? "/placeholder-poster.svg";
      const isFeatured = FEATURED_TMDB_IDS.has(item.id);
      // No site-name suffix here — the root layout's title template ("%s | ดูแฮร์รี่พอตเตอร์")
      // already appends it; adding it here too would duplicate the brand name in <title>.
      const seoTitle = `${item.title} (${englishTitle}) พากย์ไทย ซับไทย เต็มเรื่อง`;
      const seoDescription = `${item.title} เรื่องย่อ นักแสดง เรตติ้ง และข้อมูลภาพยนตร์ครบถ้วน อัปเดตจากดูแฮร์รี่พอตเตอร์`;
      const bodyHtml = `<p>${overview}</p><p>${LONGTAIL_NOTE}</p>`;

      await prisma.article.upsert({
        where: { slug },
        update: {
          title: item.title,
          coverImageAlt: item.title,
          excerpt,
          bodyHtml,
          coverImageUrl,
          tags,
          episodeLabel,
          studio: "Warner Bros. Pictures",
          status: "completed",
          rating,
          isFeatured,
          seoTitle,
          seoDescription,
          categoryId,
        },
        create: {
          slug,
          title: item.title,
          excerpt,
          bodyHtml,
          coverImageUrl,
          coverImageAlt: item.title,
          tags,
          episodeLabel,
          studio: "Warner Bros. Pictures",
          status: "completed",
          rating,
          isFeatured,
          seoTitle,
          seoDescription,
          categoryId,
          authorId: authorIds[articleIndex % authorIds.length],
          publishedAt: item.releaseDate ? new Date(item.releaseDate) : new Date(),
        },
      });

      articleIndex += 1;
    }

    console.log(`Seeded ${thaiResults.length} items for category "${category.name}"`);
  }

  // Cross-link every film within a category to the rest of that category, so the "เรื่องที่
  // เกี่ยวข้อง" section on each title page shows the other films in the same saga.
  for (const category of CATEGORY_SEED) {
    const categoryId = categoryIdBySlug.get(category.slug);
    if (!categoryId) continue;
    const rows = await prisma.article.findMany({ where: { categoryId }, select: { id: true, slug: true } });
    for (const row of rows) {
      const relatedSlugs = rows.filter((other) => other.id !== row.id).map((other) => other.slug);
      await prisma.article.update({ where: { id: row.id }, data: { relatedSlugs } });
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "home_category_slugs" },
    update: { value: JSON.stringify(HOME_CATEGORY_SLUGS) },
    create: { key: "home_category_slugs", value: JSON.stringify(HOME_CATEGORY_SLUGS) },
  });

  await prisma.siteSetting.upsert({
    where: { key: "home_seo_content" },
    update: { value: HOME_SEO_CONTENT },
    create: { key: "home_seo_content", value: HOME_SEO_CONTENT },
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
