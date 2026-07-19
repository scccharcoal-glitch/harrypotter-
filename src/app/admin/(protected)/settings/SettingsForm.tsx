"use client";

import { useActionState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { SponsorLink } from "@/lib/services/settings";
import type { Category } from "@/lib/types";
import { saveSiteSettings } from "./actions";

export function SettingsForm({
  siteTitle,
  siteDescription,
  siteShareImage,
  categories,
  homeCategorySlugs,
  homeSeoContent,
  sponsorLinks,
  blobEnabled,
}: {
  siteTitle: string;
  siteDescription: string;
  siteShareImage: string;
  categories: Category[];
  homeCategorySlugs: string[];
  homeSeoContent: string;
  sponsorLinks: SponsorLink[];
  blobEnabled: boolean;
}) {
  const [state, formAction, isPending] = useActionState(saveSiteSettings, undefined);
  const seoCategories = categories.filter((category) => category.slug !== "blog");

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="siteTitle" className="text-sm font-semibold text-slate-700">
          Site Title
        </label>
        <input
          id="siteTitle"
          name="siteTitle"
          required
          defaultValue={siteTitle}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="siteDescription" className="text-sm font-semibold text-slate-700">
          Site Meta Description
        </label>
        <textarea
          id="siteDescription"
          name="siteDescription"
          required
          rows={4}
          defaultValue={siteDescription}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-rose-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">ภาพ Thumbnail เวลาแชร์หน้าเว็บ</label>
        <ImageUploadField name="siteShareImage" initialUrl={siteShareImage} blobEnabled={blobEnabled} />
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-5">
        <label htmlFor="sponsorLinks" className="text-sm font-semibold text-slate-700">
          Sponsor Link ใน Footer
        </label>
        <textarea
          id="sponsorLinks"
          name="sponsorLinks"
          rows={6}
          defaultValue={sponsorLinks.map((link) => `${link.label} | ${link.url}`).join("\n")}
          placeholder={"สมาคมค้าทองคำ | https://example.com\nราคาทอง 1 บาท | https://example.com/gold"}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 focus:border-rose-500 focus:outline-none"
        />
        <p className="text-xs leading-5 text-slate-400">
          ใส่หนึ่งลิงก์ต่อหนึ่งบรรทัดในรูปแบบ ชื่อลิงก์ | URL หากยังไม่ใส่ ลิงก์ Sponsor จะไม่แสดง
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="homeSeoContent" className="text-sm font-semibold text-slate-700">
          เนื้อหา SEO หน้า Home
        </label>
        <textarea
          id="homeSeoContent"
          name="homeSeoContent"
          rows={12}
          defaultValue={homeSeoContent}
          placeholder="เขียนเนื้อหาที่อธิบายว่าเว็บไซต์นี้มีข้อมูลอะไร เหมาะกับใคร และช่วยผู้ใช้อย่างไร..."
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 focus:border-rose-500 focus:outline-none"
        />
        <p className="text-xs text-slate-400">
          จะแสดงด้านล่างหน้า Home รองรับ HTML เช่น &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;a&gt;, รายการ และรูปภาพ
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-700">หมวดหมู่ที่แสดงบนหน้าแรก</p>
          <p className="mt-1 text-xs text-slate-400">
            เลือกว่าหมวดไหนจะมีบล็อกของตัวเองบนหน้าแรก ไม่เลือก = ไม่แสดง
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <label
              key={category.slug}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                name="homeCategorySlugs"
                value={category.slug}
                defaultChecked={homeCategorySlugs.includes(category.slug)}
                className="h-4 w-4 accent-rose-600"
              />
              <span>{category.name}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-400">ยังไม่มีหมวดหมู่ ไปสร้างที่หน้าหมวดหมู่ก่อน</p>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">เนื้อหา SEO ของแต่ละหมวด</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            เนื้อหาจะแสดงด้านล่างหน้าหมวด รองรับ HTML และระบบจะกรองโค้ดอันตรายให้อัตโนมัติ
          </p>
        </div>

        {seoCategories.map((category) => (
          <label key={category.id} className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
            {category.name}
            <span className="text-xs font-normal text-slate-400">/category/{category.slug}</span>
            <textarea
              name={`categorySeoContent:${category.id}`}
              rows={8}
              defaultValue={category.seoContent}
              placeholder={`เขียนเนื้อหา SEO สำหรับหมวด ${category.name}...`}
              className="rounded-lg border border-slate-300 px-3 py-2.5 font-normal leading-6 focus:border-rose-500 focus:outline-none"
            />
          </label>
        ))}
      </section>

      {state?.error && <p className="text-sm text-rose-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">บันทึกเรียบร้อย</p>}

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
