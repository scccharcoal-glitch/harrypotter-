import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแล",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error =
    params?.error === "invalid"
      ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
      : params?.error === "config"
        ? "ระบบล็อกอินยังตั้งค่าไม่ครบ"
        : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide">
          <span className="text-rose-600">ดูแฮร์รี่</span>
          <span className="ml-1 text-slate-900">พอตเตอร์</span>
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">เข้าสู่ระบบผู้ดูแล</h1>
        <LoginForm error={error} />
      </div>
    </div>
  );
}
