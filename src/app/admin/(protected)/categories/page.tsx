import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryRow } from "./CategoryRow";
import { NewCategoryForm } from "./NewCategoryForm";

export const metadata: Metadata = {
  title: "หมวดหมู่",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900">หมวดหมู่</h1>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
              <th className="px-4 py-3">ชื่อ / Slug / สี / ลำดับ</th>
              <th className="px-4 py-3 text-center">จำนวนเรื่อง</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} articleCount={category._count.articles} />
            ))}
          </tbody>
        </table>
      </div>

      <NewCategoryForm />

      <p className="mt-4 text-xs text-slate-400">
        เลือกว่าหมวดไหนจะแสดงบนหน้าแรกได้ที่หน้า{" "}
        <Link href="/admin/settings" prefetch={false} className="text-rose-600 hover:underline">
          ตั้งค่าเว็บไซต์
        </Link>
      </p>
    </div>
  );
}
