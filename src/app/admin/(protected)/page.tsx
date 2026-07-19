import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แดชบอร์ด",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [articleCount, categoryCount, authorCount, redirectCount] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.author.count(),
    prisma.redirect.count(),
  ]);

  const stats = [
    { label: "ภาพยนตร์ทั้งหมด", value: articleCount },
    { label: "หมวดหมู่", value: categoryCount },
    { label: "ผู้อัปโหลด", value: authorCount },
    { label: "Redirect ที่ตั้งค่าไว้", value: redirectCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">แดชบอร์ด</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-3xl font-extrabold text-rose-600">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-700">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
