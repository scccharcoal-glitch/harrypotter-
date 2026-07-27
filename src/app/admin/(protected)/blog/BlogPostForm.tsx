"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type BlogPostAction = (
  previousState: { error?: string } | undefined,
  formData: FormData
) => Promise<{ error?: string } | undefined>;

export type BlogPostFormValue = {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string;
  isPublished: boolean;
};

const fieldClass =
  "min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100";

export function BlogPostForm({
  action,
  post,
  blobEnabled,
}: {
  action: BlogPostAction;
  post?: BlogPostFormValue;
  blobEnabled: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-6xl flex-col gap-7">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          ชื่อบทความ
          <input
            name="title"
            required
            defaultValue={post?.title}
            placeholder="เช่น 7 เกร็ดน่ารู้ก่อนดู Harry Potter"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          Slug
          <input
            name="slug"
            defaultValue={post?.slug}
            placeholder="เว้นว่างเพื่อสร้างจากชื่อบทความ"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        เกริ่นนำ
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt}
          placeholder="สรุปสั้น ๆ เพื่อแสดงในหน้ารวมบทความและผลการค้นหา"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-slate-700">เนื้อหาบทความ</p>
        <RichTextEditor name="bodyHtml" initialHtml={post?.bodyHtml} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-slate-700">รูปปก</p>
          <ImageUploadField
            name="coverImageUrl"
            initialUrl={post?.coverImageUrl}
            blobEnabled={blobEnabled}
            variant="landscape"
          />
        </div>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          คำอธิบายรูปปก (Alt text)
          <input
            name="coverImageAlt"
            defaultValue={post?.coverImageAlt}
            placeholder="เว้นว่างเพื่อใช้ชื่อบทความ"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          หมวดหมู่
          <input name="category" defaultValue={post?.category} placeholder="เช่น เบื้องหลังภาพยนตร์" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          แท็ก
          <input
            name="tags"
            defaultValue={post?.tags.join(", ")}
            placeholder="Harry Potter, เบื้องหลัง, ตัวละคร"
            className={fieldClass}
          />
          <span className="text-xs font-normal text-slate-400">คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค</span>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          SEO Title
          <input name="seoTitle" defaultValue={post?.seoTitle ?? ""} placeholder="เว้นว่างเพื่อใช้ชื่อบทความ" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
          วันที่เผยแพร่
          <input
            name="publishedAt"
            type="date"
            required
            defaultValue={post?.publishedAt ?? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
        SEO Description
        <textarea
          name="seoDescription"
          rows={3}
          defaultValue={post?.seoDescription ?? ""}
          placeholder="เว้นว่างเพื่อใช้ข้อความเกริ่นนำ"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-normal text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
        />
      </label>

      <label className="flex w-fit items-center gap-3 text-base font-bold text-slate-700">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={post?.isPublished}
          className="h-5 w-5 accent-rose-600"
        />
        เผยแพร่ทันที
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="min-w-44 rounded-full bg-rose-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกบทความ"}
        </button>
        <Link
          href="/admin/blog"
          prefetch={false}
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-500"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}
