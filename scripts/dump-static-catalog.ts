import { writeFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [categories, authors, articles, settings] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany(),
    prisma.article.findMany({ include: { category: true, author: true }, orderBy: { publishedAt: "asc" } }),
    prisma.siteSetting.findMany(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    categories,
    authors,
    articles,
    settings,
  };

  writeFileSync("src/lib/static-catalog.json", JSON.stringify(payload, null, 2) + "\n");
  console.log(`Dumped ${articles.length} articles, ${categories.length} categories to src/lib/static-catalog.json`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
