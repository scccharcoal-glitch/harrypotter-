"use client";

import { deleteRedirect } from "./actions";

export function DeleteRedirectButton({ id }: { id: string }) {
  return (
    <form
      action={deleteRedirect.bind(null, id)}
      onSubmit={(e) => {
        if (!window.confirm("ยืนยันการลบ redirect นี้?")) {
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
