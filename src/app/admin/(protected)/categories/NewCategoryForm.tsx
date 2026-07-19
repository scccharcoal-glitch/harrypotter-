"use client";

import { useActionState } from "react";
import { createCategory } from "./actions";

export function NewCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ชื่อหมวดหมู่</label>
        <input name="name" required className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">Slug (เว้นว่างได้)</label>
        <input name="slug" className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">สีประจำหมวด</label>
        <select name="accentColor" defaultValue="red" className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
          <option value="red">red</option>
          <option value="green">green</option>
          <option value="gold">gold</option>
          <option value="blue">blue</option>
          <option value="purple">purple</option>
          <option value="pink">pink</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ลำดับ</label>
        <input name="sortOrder" type="number" defaultValue={0} className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex w-full flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">เนื้อหา SEO ของหมวดหมู่</label>
        <textarea
          name="seoContent"
          rows={5}
          placeholder="เขียนเนื้อหาเฉพาะหมวดหมู่ เว้นว่างไว้แล้วเพิ่มภายหลังก็ได้"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-6"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-rose-600 px-5 py-2 text-sm font-bold uppercase text-white hover:bg-rose-700 disabled:opacity-60"
      >
        + เพิ่มหมวดหมู่
      </button>
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
