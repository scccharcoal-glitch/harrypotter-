"use client";

import { useTransition } from "react";
import { deleteBlogPost } from "./actions";

export function DeleteBlogPostButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`ลบบทความ “${title}” ใช่หรือไม่?`)) return;
        startTransition(() => {
          void deleteBlogPost(id);
        });
      }}
      className="font-semibold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-rose-700 disabled:opacity-50"
    >
      {isPending ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}
