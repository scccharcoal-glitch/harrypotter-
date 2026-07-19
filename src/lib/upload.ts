import path from "path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeFilename(name: string): string {
  const ext = path.extname(name);
  const base = path
    .basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 60);
  return `${Date.now()}-${base || "upload"}${ext}`;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Uploads a file to Vercel Blob. Vercel's serverless filesystem is read-only
 * at request time, so there is no local-disk fallback — if BLOB_READ_WRITE_TOKEN
 * isn't set, this throws rather than silently writing to public/uploads (which
 * would work locally but fail, or worse, silently no-op, in production). The
 * upload UI is disabled client-side whenever isBlobConfigured() is false, so
 * this should only be reachable via a direct API call with no token configured.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!isBlobConfigured()) {
    throw new Error("ยังไม่ได้เปิด Vercel Blob (BLOB_READ_WRITE_TOKEN)");
  }

  const filename = sanitizeFilename(file.name);
  const { put } = await import("@vercel/blob");
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
