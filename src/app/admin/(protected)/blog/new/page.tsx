import type { Metadata } from "next";
import { isBlobConfigured } from "@/lib/upload";
import { BlogPostForm } from "../BlogPostForm";
import { createBlogPost } from "../actions";

export const metadata: Metadata = {
  title: "เขียนบทความใหม่",
  robots: { index: false, follow: false },
};

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-rose-600">บทความ</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">เขียนบทความใหม่</h1>
      </div>
      <BlogPostForm action={createBlogPost} blobEnabled={isBlobConfigured()} />
    </div>
  );
}
