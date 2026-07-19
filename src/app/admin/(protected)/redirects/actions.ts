"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invalidateRedirectCache } from "@/lib/redirects-cache";

export async function createRedirect(_prevState: { error?: string } | undefined, formData: FormData) {
  const source = String(formData.get("source") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const statusCode = Number(formData.get("statusCode") ?? 301);

  if (!source.startsWith("/")) {
    return { error: "Source path ต้องขึ้นต้นด้วย /" };
  }
  if (!destination) {
    return { error: "กรุณากรอกปลายทาง" };
  }

  try {
    await prisma.redirect.create({ data: { source, destination, statusCode } });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมี source path นี้อยู่แล้ว" };
  }

  invalidateRedirectCache();
  revalidatePath("/admin/redirects");
  return {};
}

export async function deleteRedirect(id: string) {
  await prisma.redirect.delete({ where: { id } });
  invalidateRedirectCache();
  revalidatePath("/admin/redirects");
}
