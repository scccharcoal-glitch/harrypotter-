import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { NewRedirectForm } from "./NewRedirectForm";
import { DeleteRedirectButton } from "./DeleteRedirectButton";

export const metadata: Metadata = {
  title: "Redirect 301",
  robots: { index: false, follow: false },
};

export default async function AdminRedirectsPage() {
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Redirect 301</h1>
      <p className="mb-6 text-sm text-slate-400">
        ตั้งค่าเส้นทางเปลี่ยนหน้าถาวร (301) หรือชั่วคราว (302) การเปลี่ยนแปลงอาจใช้เวลาถึง 1 นาทีจึงจะมีผล
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
              <th className="px-4 py-3">จาก</th>
              <th className="px-4 py-3">ไปยัง</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {redirects.map((redirect) => (
              <tr key={redirect.id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-4 py-3 font-mono text-slate-900">{redirect.source}</td>
                <td className="px-4 py-3 font-mono text-slate-700">{redirect.destination}</td>
                <td className="px-4 py-3 text-slate-700">{redirect.statusCode}</td>
                <td className="px-4 py-3 text-right">
                  <DeleteRedirectButton id={redirect.id} />
                </td>
              </tr>
            ))}
            {redirects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  ยังไม่มี redirect ที่ตั้งค่าไว้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewRedirectForm />
    </div>
  );
}
