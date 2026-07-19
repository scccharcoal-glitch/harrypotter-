"use client";

import { deleteArticle } from "./actions";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteArticle.bind(null, id)}
      onSubmit={(e) => {
        if (!window.confirm(`ลบ "${title}"?`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="font-semibold text-slate-400 hover:text-rose-600 hover:underline">
        ลบ
      </button>
    </form>
  );
}
