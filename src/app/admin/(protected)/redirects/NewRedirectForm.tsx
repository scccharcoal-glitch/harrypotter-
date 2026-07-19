"use client";

import { useActionState } from "react";
import { createRedirect } from "./actions";

export function NewRedirectForm() {
  const [state, formAction, isPending] = useActionState(createRedirect, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">Source path (เริ่มด้วย /)</label>
        <input
          name="source"
          required
          placeholder="/old-article-path"
          className="w-64 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ปลายทาง (path หรือ URL เต็ม)</label>
        <input
          name="destination"
          required
          placeholder="/category/anime/new-slug"
          className="w-64 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">Status Code</label>
        <select name="statusCode" defaultValue="301" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="301">301 (ถาวร)</option>
          <option value="302">302 (ชั่วคราว)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-rose-600 px-5 py-2 text-sm font-bold uppercase text-white hover:bg-rose-700 disabled:opacity-60"
      >
        + เพิ่ม Redirect
      </button>
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
