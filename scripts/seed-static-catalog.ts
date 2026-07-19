import { PrismaClient } from "@prisma/client";
import catalog from "../src/lib/static-catalog.json";

const prisma = new PrismaClient();

async function main() {
  const existingArticles = await prisma.article.count();
  if (existingArticles > 0) {
    console.log(`Catalog already has ${existingArticles} articles; skipping static seed.`);
    return;
  }

  for (const category of catalog.categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        accentColor: category.accentColor,
        sortOrder: category.sortOrder,
        seoContent: category.seoContent,
      },
      create: category,
    });
  }

  for (const author of catalog.authors) {
    await prisma.author.upsert({
      where: { name: author.name },
      update: {
        role: author.role,
        avatarUrl: author.avatarUrl,
        bio: author.bio,
      },
      create: author,
    });
  }

  for (const setting of catalog.settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  for (const article of catalog.articles) {
    const { category, author, ...articleData } = article;
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        bodyHtml: article.bodyHtml,
        coverImageUrl: article.coverImageUrl,
        coverImageAlt: article.coverImageAlt,
        tags: article.tags,
        episodeLabel: article.episodeLabel,
        studio: article.studio,
        status: article.status,
        rating: article.rating,
        publishedAt: new Date(article.publishedAt),
        isFeatured: article.isFeatured,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        watchUrl: article.watchUrl,
        relatedSlugs: article.relatedSlugs,
        categoryId: category.id,
        authorId: author.id,
      },
      create: {
        ...articleData,
        publishedAt: new Date(article.publishedAt),
        updatedAt: new Date(article.updatedAt),
        categoryId: category.id,
        authorId: author.id,
      },
    });
  }

  const [categories, authors, articles, settings] = await Promise.all([
    prisma.category.count(),
    prisma.author.count(),
    prisma.article.count(),
    prisma.siteSetting.count(),
  ]);

  console.log(`Seeded catalog: ${categories} categories, ${authors} authors, ${articles} articles, ${settings} settings`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
