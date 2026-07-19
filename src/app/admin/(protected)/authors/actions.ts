"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function readAuthorFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || null,
    avatarUrl: String(formData.get("avatarUrl") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
  };
}

function revalidateAuthorPages() {
  revalidatePath("/");
}

export async function createAuthor(_prevState: { error?: string } | undefined, formData: FormData) {
  const fields = readAuthorFields(formData);

  if (!fields.name) {
    return { error: "กรุณากรอกชื่อผู้อัปโหลด" };
  }

  try {
    await prisma.author.create({ data: fields });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมีชื่อนี้อยู่แล้ว" };
  }

  revalidateAuthorPages();
  return {};
}

export async function updateAuthor(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const fields = readAuthorFields(formData);

  if (!fields.name) {
    return { error: "กรุณากรอกชื่อผู้อัปโหลด" };
  }

  try {
    await prisma.author.update({ where: { id }, data: fields });
  } catch {
    return { error: "ไม่สามารถบันทึกได้ อาจมีชื่อนี้อยู่แล้ว" };
  }

  revalidateAuthorPages();
  return {};
}

export async function deleteAuthor(id: string) {
  try {
    await prisma.author.delete({ where: { id } });
  } catch {
    return;
  }
  revalidateAuthorPages();
}
