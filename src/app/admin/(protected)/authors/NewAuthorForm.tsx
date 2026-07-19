"use client";

import { useActionState } from "react";
import { createAuthor } from "./actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function NewAuthorForm({ blobEnabled }: { blobEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(createAuthor, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-wrap items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ชื่อผู้อัปโหลด</label>
        <input name="name" required className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ตำแหน่ง</label>
        <input name="role" placeholder="เช่น ทีมอัปโหลด" className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">ประวัติย่อ</label>
        <textarea name="bio" rows={2} className="w-64 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-700">รูปโปรไฟล์</label>
        <ImageUploadField name="avatarUrl" blobEnabled={blobEnabled} />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-rose-600 px-5 py-2 text-sm font-bold uppercase text-white hover:bg-rose-700 disabled:opacity-60"
      >
        + เพิ่มผู้อัปโหลด
      </button>
      {state?.error && <p className="w-full text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
