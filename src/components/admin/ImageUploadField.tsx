"use client";

import { useState } from "react";
import Image from "next/image";
import { isAllowedImageHost } from "@/lib/image-host";

// Mirrors MAX_UPLOAD_BYTES in src/lib/upload.ts — duplicated rather than imported
// because that module pulls in Node-only APIs that can't ship to the client bundle.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function ImageUploadField({
  name,
  initialUrl,
  blobEnabled,
  variant = "poster",
}: {
  name: string;
  initialUrl?: string;
  blobEnabled: boolean;
  variant?: "poster" | "landscape";
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("รองรับเฉพาะไฟล์รูปภาพ");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "อัปโหลดไม่สำเร็จ");
      }
      const { url: uploadedUrl } = await response.json();
      setUrl(uploadedUrl);
      setPreviewFailed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {url && !previewFailed && (
        <div
          className={
            variant === "landscape"
              ? "relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl bg-slate-900"
              : "relative h-40 w-28 overflow-hidden rounded-lg bg-slate-900"
          }
        >
          {isAllowedImageHost(url) ? (
            <Image
              src={url}
              alt="ตัวอย่างรูปปก"
              fill
              sizes={variant === "landscape" ? "(max-width: 1024px) 100vw, 640px" : "160px"}
              className="object-cover"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            // arbitrary external host, can't go through next/image's domain-restricted optimizer
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="ตัวอย่างรูปปก"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setPreviewFailed(true)}
            />
          )}
        </div>
      )}
      <div>
        <input
          type="file"
          accept="image/*"
          disabled={!blobEnabled}
          onChange={handleFileChange}
          className="text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-rose-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:file:bg-slate-300"
        />
        {!blobEnabled && <p className="mt-1 text-xs text-amber-600">ยังไม่ได้เปิด Vercel Blob</p>}
      </div>
      <input
        // Deliberately type="text", not type="url" — browsers enforce an absolute-URL
        // format on type="url" inputs, which rejects the relative "/title/slug" paths
        // this field is meant to accept. Validation happens server-side instead.
        type="text"
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setError(null);
          setPreviewFailed(false);
        }}
        placeholder={
          variant === "landscape"
            ? "วาง URL รูปปก หรือเลือกรูปจากเครื่อง"
            : "https://image.tmdb.org/... หรือวาง URL หน้าเรื่องในเว็บนี้ เช่น /title/moana-1108427"
        }
        aria-label="URL รูปโปสเตอร์ หรือ URL หน้าเรื่องในเว็บนี้"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
      />
      <p className="text-xs text-slate-400">
        {variant === "landscape"
          ? "รองรับ JPG, PNG, WEBP และ GIF ขนาดไม่เกิน 5 MB — แนะนำรูปแนวนอนอัตราส่วน 16:9"
          : "เว้นว่างไว้ได้ — ถ้าไม่ใส่รูปจะใช้รูปสำรองแทนและยังโพสต์ได้ปกติ ถ้าวาง URL หน้าเรื่องในเว็บนี้ ระบบจะดึงรูปปกของเรื่องนั้นมาใช้ให้อัตโนมัติตอนบันทึก"}
      </p>
      {isUploading && <p className="text-xs text-slate-400">กำลังอัปโหลด...</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <input type="hidden" name={name} value={url} readOnly />
    </div>
  );
}
