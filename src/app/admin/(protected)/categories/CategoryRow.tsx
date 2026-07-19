"use client";

import { useActionState } from "react";
import { updateCategory, deleteCategory } from "./actions";
import { Category } from "@/lib/types";

const ACCENT_OPTIONS = ["red", "green", "gold", "blue", "purple", "pink"];

export function CategoryRow({ category, articleCount }: { category: Category; articleCount: number }) {
  const [state, formAction, isPending] = useActionState(updateCategory.bind(null, category.id), undefined);

  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="px-4 py-3">
        <form id={`cat-form-${category.id}`} action={formAction} className="flex flex-wrap items-center gap-2">
          <input
            name="name"
            defaultValue={category.name}
            className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            name="slug"
            defaultValue={category.slug}
            className="w-40 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <select
            name="accentColor"
            defaultValue={category.accentColor}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            {ACCENT_OPTIONS.map((accent) => (
              <option key={accent} value={accent}>
                {accent}
              </option>
            ))}
          </select>
          <input
            name="sortOrder"
            type="number"
            defaultValue={category.sortOrder}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <label className="mt-2 flex w-full flex-col gap-1 text-xs font-semibold text-slate-700">
            เนื้อหา SEO ของหมวดหมู่
            <textarea
              name="seoContent"
              rows={6}
              defaultValue={category.seoContent}
              placeholder={`อธิบายเนื้อหาในหมวด ${category.name} สำหรับผู้อ่านและ Google...`}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal leading-6"
            />
            <span className="font-normal text-slate-400">รองรับ HTML และจะแสดงด้านล่างหน้าหมวด</span>
          </label>
        </form>
        {state?.error && <p className="mt-1 text-xs text-rose-600">{state.error}</p>}
      </td>
      <td className="px-4 py-3 text-center text-slate-700">{articleCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            form={`cat-form-${category.id}`}
            disabled={isPending}
            className="font-semibold text-rose-600 hover:underline disabled:opacity-60"
          >
            บันทึก
          </button>
          <form
            action={deleteCategory.bind(null, category.id)}
            onSubmit={(e) => {
              if (!window.confirm(`ลบหมวดหมู่ "${category.name}"?`)) {
                e.preventDefault();
              }
            }}
          >
            <button type="submit" className="font-semibold text-slate-400 hover:text-rose-600 hover:underline">
              ลบ
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
