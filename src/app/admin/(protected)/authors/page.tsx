import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { AuthorRow } from "./AuthorRow";
import { NewAuthorForm } from "./NewAuthorForm";

export const metadata: Metadata = {
  title: "ผู้อัปโหลด",
  robots: { index: false, follow: false },
};

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  const blobEnabled = isBlobConfigured();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">ผู้อัปโหลด</h1>
      <p className="mb-6 text-sm text-slate-400">
        จัดการโปรไฟล์ผู้อัปโหลด — รูป ตำแหน่ง และประวัติย่อ จะแสดงท้ายหน้าเรื่องแต่ละเรื่อง
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
              <th className="px-4 py-3">รูป</th>
              <th className="px-4 py-3">ชื่อ / ตำแหน่ง / ประวัติย่อ</th>
              <th className="px-4 py-3 text-center">จำนวนเรื่อง</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <AuthorRow
                key={author.id}
                author={author}
                articleCount={author._count.articles}
                blobEnabled={blobEnabled}
              />
            ))}
          </tbody>
        </table>
      </div>

      <NewAuthorForm blobEnabled={blobEnabled} />
    </div>
  );
}
