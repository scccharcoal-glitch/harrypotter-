import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteArticleButton } from "./DeleteArticleButton";

export const metadata: Metadata = {
  title: "ภาพยนตร์",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanParam(value: string | string[] | undefined) {
  return firstParam(value)?.trim() ?? "";
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstParam(value) ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = cleanParam(params.q);
  const categorySlug = cleanParam(params.category);
  const requestedPage = parsePage(params.page);

  const whereParts: Prisma.ArticleWhereInput[] = [];

  if (query) {
    whereParts.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { episodeLabel: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  if (categorySlug) {
    whereParts.push({ category: { slug: categorySlug } });
  }

  const where: Prisma.ArticleWhereInput = whereParts.length > 0 ? { AND: whereParts } : {};
  const [totalItems, categories] = await Promise.all([
    prisma.article.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      slug: true,
      title: true,
      isFeatured: true,
      episodeLabel: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });
  const showingFrom = totalItems === 0 ? 0 : skip + 1;
  const showingTo = Math.min(skip + articles.length, totalItems);

  const buildPageHref = (page: number) => {
    const nextParams = new URLSearchParams();

    if (query) {
      nextParams.set("q", query);
    }

    if (categorySlug) {
      nextParams.set("category", categorySlug);
    }

    if (page > 1) {
      nextParams.set("page", String(page));
    }

    const search = nextParams.toString();
    return search ? `/admin/articles?${search}` : "/admin/articles";
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">ภาพยนตร์</h1>
          <p className="mt-1 text-sm text-slate-500">
            แสดง {showingFrom.toLocaleString("th-TH")}-{showingTo.toLocaleString("th-TH")} จากทั้งหมด{" "}
            {totalItems.toLocaleString("th-TH")} เรื่อง
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          prefetch={false}
          className="inline-flex justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-rose-700"
        >
          + เพิ่มเรื่องใหม่
        </Link>
      </div>

      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="sr-only" htmlFor="article-search">
          ค้นหาเรื่อง
        </label>
        <input
          id="article-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ค้นหาจากชื่อเรื่อง, slug หรือตอนล่าสุด"
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
        />
        <label className="sr-only" htmlFor="article-category">
          หมวดหมู่
        </label>
        <select
          id="article-category"
          name="category"
          defaultValue={categorySlug}
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-rose-500"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          ค้นหา
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
              <th className="px-4 py-3">ชื่อเรื่อง</th>
              <th className="px-4 py-3">หมวดหมู่</th>
              <th className="px-4 py-3">ตอนล่าสุด</th>
              <th className="px-4 py-3">เผยแพร่</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <span className="block">{article.title}</span>
                  <span className="mt-1 block text-xs font-normal text-slate-400">{article.slug}</span>
                  {article.isFeatured && (
                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                      เด่น
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{article.category.name}</td>
                <td className="px-4 py-3 text-slate-700">{article.episodeLabel ?? "-"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(article.publishedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      prefetch={false}
                      className="font-semibold text-rose-600 hover:underline"
                    >
                      แก้ไข
                    </Link>
                    <DeleteArticleButton id={article.id} title={article.title} />
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  {query || categorySlug ? "ไม่พบเรื่องที่ตรงกับคำค้นหาหรือตัวกรองนี้" : "ยังไม่มีเรื่องในระบบ"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          หน้า {currentPage.toLocaleString("th-TH")} จาก {totalPages.toLocaleString("th-TH")}
        </p>
        <div className="flex gap-2">
          {currentPage > 1 ? (
            <Link
              href={buildPageHref(currentPage - 1)}
              prefetch={false}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-rose-500 hover:text-rose-600"
            >
              ก่อนหน้า
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-full border border-slate-100 px-4 py-2 font-semibold text-slate-300">
              ก่อนหน้า
            </span>
          )}
          {currentPage < totalPages ? (
            <Link
              href={buildPageHref(currentPage + 1)}
              prefetch={false}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:border-rose-500 hover:text-rose-600"
            >
              ถัดไป
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-full border border-slate-100 px-4 py-2 font-semibold text-slate-300">
              ถัดไป
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
