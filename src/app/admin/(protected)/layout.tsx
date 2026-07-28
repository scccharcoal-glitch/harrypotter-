import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/admin", label: "แดชบอร์ด" },
  { href: "/admin/articles", label: "ภาพยนตร์" },
  { href: "/admin/blog", label: "บทความ" },
  { href: "/admin/categories", label: "หมวดหมู่" },
  { href: "/admin/authors", label: "ผู้อัปโหลด" },
  { href: "/admin/redirects", label: "Redirect 301" },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์" },
];

// Defense in depth alongside src/middleware.ts (which is the primary gate).
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isValid = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!isValid) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell flex min-h-screen bg-slate-100">
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white p-5">
        <p className="text-sm font-black uppercase tracking-wide">
          <span className="text-rose-600">ดูแฮร์รี่</span>
          <span className="ml-1 text-slate-900">พอตเตอร์</span>
        </p>
        <p className="mb-6 text-xs text-slate-400">ระบบหลังบ้าน</p>

        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-rose-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/api/admin/logout" method="post" className="mt-auto pt-6">
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-rose-600 hover:text-rose-600"
          >
            ออกจากระบบ
          </button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
