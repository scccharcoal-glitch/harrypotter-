import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { uploadImage, isBlobConfigured, MAX_UPLOAD_BYTES } from "@/lib/upload";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isValid = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!isValid) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
  }

  if (!isBlobConfigured()) {
    return NextResponse.json({ error: "ยังไม่ได้เปิด Vercel Blob" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป (สูงสุด 5MB)" }, { status: 400 });
  }

  const url = await uploadImage(file);
  return NextResponse.json({ url });
}
