"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateAuthor, deleteAuthor } from "./actions";
import { Author } from "@/lib/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function AuthorRow({
  author,
  articleCount,
  blobEnabled,
}: {
  author: Author;
  articleCount: number;
  blobEnabled: boolean;
}) {
  const [state, formAction, isPending] = useActionState(updateAuthor.bind(null, author.id), undefined);

  return (
    <tr className="border-b border-slate-200 align-top last:border-b-0">
      <td className="px-4 py-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-900">
          {author.avatarUrl ? (
            <Image src={author.avatarUrl} alt={author.name} fill sizes="48px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/70">
              {author.name.slice(0, 1)}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <form id={`author-form-${author.id}`} action={formAction} className="flex flex-col gap-2">
          <input
            name="name"
            defaultValue={author.name}
            placeholder="ชื่อผู้อัปโหลด"
            className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            name="role"
            defaultValue={author.role ?? ""}
            placeholder="ตำแหน่ง เช่น ทีมอัปโหลด"
            className="w-48 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <textarea
            name="bio"
            defaultValue={author.bio ?? ""}
            placeholder="ประวัติย่อ"
            rows={2}
            className="w-64 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <ImageUploadField name="avatarUrl" initialUrl={author.avatarUrl ?? undefined} blobEnabled={blobEnabled} />
        </form>
        {state?.error && <p className="mt-1 text-xs text-rose-600">{state.error}</p>}
      </td>
      <td className="px-4 py-3 text-center text-slate-700">{articleCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            form={`author-form-${author.id}`}
            disabled={isPending}
            className="font-semibold text-rose-600 hover:underline disabled:opacity-60"
          >
            บันทึก
          </button>
          <form
            action={deleteAuthor.bind(null, author.id)}
            onSubmit={(e) => {
              if (!window.confirm(`ลบผู้อัปโหลด "${author.name}"?`)) {
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
