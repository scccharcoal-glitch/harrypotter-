export function LoginForm({ error }: { error?: string }) {
  return (
    <form action="/api/admin/login" method="post" className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-semibold text-slate-700">
          ชื่อผู้ใช้
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">
          รหัสผ่าน
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        className="mt-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-rose-700"
      >
        เข้าสู่ระบบ
      </button>
    </form>
  );
}
