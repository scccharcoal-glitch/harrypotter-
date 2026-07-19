"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Article, Author, Category } from "@/lib/types";

type ArticleAction = (
  prevState: { error?: string } | undefined,
  formData: FormData
) => Promise<{ error?: string } | undefined>;

export function ArticleForm({
  categories,
  authors,
  article,
  action,
  blobEnabled,
}: {
  categories: Category[];
  authors: Author[];
  article?: Article;
  action: ArticleAction;
  blobEnabled: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {state?.error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-semibold text-slate-700">
          ชื่อเรื่อง
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={article?.title}
          placeholder="เช่น Blade Of Wind And Thunder"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
          Slug (URL) — เว้นว่างเพื่อสร้างอัตโนมัติจากชื่อเรื่อง
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={article?.slug}
          placeholder="เช่น blade-of-wind-and-thunder"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-semibold text-slate-700">
          เรื่องย่อ — เว้นว่างเพื่อใช้ชื่อเรื่องแทน
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={article?.excerpt}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-slate-700">เนื้อหาบทความ</p>
        <RichTextEditor name="bodyHtml" initialHtml={article?.bodyHtml} />
        <p className="text-xs leading-5 text-slate-400">
          ลากเลือกข้อความก่อนกดตัวหนา หรือใส่ลิงก์ภายใน เช่น /title/moana-1108427
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoryId" className="text-sm font-semibold text-slate-700">
            หมวดหมู่ — เว้นว่างเพื่อใช้หมวดแรกแทน
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={article?.category.id}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            <option value="" disabled>
              เลือกหมวดหมู่
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="authorId" className="text-sm font-semibold text-slate-700">
            ผู้อัปโหลด — เว้นว่างเพื่อใช้คนแรกแทน
          </label>
          <select
            id="authorId"
            name="authorId"
            defaultValue={article?.author.id}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            <option value="" disabled>
              เลือกผู้อัปโหลด
            </option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400">
            จัดการผู้อัปโหลดได้ที่หน้า{" "}
            <Link href="/admin/authors" prefetch={false} className="text-rose-600 hover:underline">
              ผู้อัปโหลด
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="episodeLabel" className="text-sm font-semibold text-slate-700">
            ตอนล่าสุด
          </label>
          <input
            id="episodeLabel"
            name="episodeLabel"
            defaultValue={article?.episodeLabel ?? ""}
            placeholder="เช่น EP 10"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="studio" className="text-sm font-semibold text-slate-700">
            สตูดิโอ
          </label>
          <input
            id="studio"
            name="studio"
            defaultValue={article?.studio ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-semibold text-slate-700">
            สถานะ
          </label>
          <select
            id="status"
            name="status"
            defaultValue={article?.status ?? "ongoing"}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          >
            <option value="ongoing">กำลังฉาย</option>
            <option value="completed">จบแล้ว</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rating" className="text-sm font-semibold text-slate-700">
            คะแนนรีวิว (0-5)
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            defaultValue={article?.rating ?? 0}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">โปสเตอร์ปก</label>
        <ImageUploadField name="coverImageUrl" initialUrl={article?.coverImageUrl} blobEnabled={blobEnabled} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="coverImageAlt" className="text-sm font-semibold text-slate-700">
          คำอธิบายรูปปก (alt text) — เว้นว่างเพื่อใช้ชื่อเรื่องแทน
        </label>
        <input
          id="coverImageAlt"
          name="coverImageAlt"
          defaultValue={article?.coverImageAlt}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-sm font-semibold text-slate-700">
          แนว/แท็ก (คั่นด้วยจุลภาค)
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={article?.tags.join(", ")}
          placeholder="เช่น Action, Fantasy, Isekai"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="relatedSlugs" className="text-sm font-semibold text-slate-700">
          Internal link — เรื่องที่เกี่ยวข้อง (ใส่ slug คั่นด้วยจุลภาค)
        </label>
        <input
          id="relatedSlugs"
          name="relatedSlugs"
          defaultValue={article?.relatedSlugs?.join(", ")}
          placeholder="เช่น squid-game-93405, moana-1108427"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
        <p className="text-xs text-slate-400">
          หา slug ได้จากท้าย URL ของหน้าเรื่องนั้น (เช่น /title/<strong>squid-game-93405</strong>) — เรื่องเหล่านี้จะขึ้นในส่วน
          &quot;เรื่องที่เกี่ยวข้อง&quot; แทนที่การสุ่มจากหมวดหมู่เดียวกัน
        </p>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-4">
        <label htmlFor="watchUrl" className="text-sm font-semibold text-slate-700">
          URL ดูตัวอย่าง/แหล่งข้อมูล
        </label>
        <input
          id="watchUrl"
          name="watchUrl"
          type="url"
          defaultValue={article?.watchUrl ?? ""}
          placeholder={article?.slug ? `/title/${article.slug}` : "https://example.com/watch/anime"}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
        <p className="text-xs leading-5 text-slate-500">
          เว้นว่างไว้ ปุ่มจะลิงก์กลับมายังหน้ารายละเอียดเรื่องนี้อัตโนมัติ หากมีหน้าดูจริงให้ใส่ URL ใหม่แทน
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">SEO (ไม่บังคับ)</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="seoTitle" className="text-xs text-slate-400">
              SEO Title — เว้นว่างเพื่อใช้ชื่อเรื่องแทน
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              defaultValue={article?.seoTitle ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="seoDescription" className="text-xs text-slate-400">
              SEO Meta Description — เว้นว่างเพื่อใช้เรื่องย่อแทน
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={article?.seoDescription ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" name="isFeatured" defaultChecked={article?.isFeatured} />
        เรื่องเด่น (แสดงบน Hero หน้าแรก)
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-rose-600 px-8 py-3 text-sm font-bold uppercase text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึก"}
      </button>
    </form>
  );
}
