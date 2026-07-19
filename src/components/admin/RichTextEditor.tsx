"use client";

import { useRef } from "react";

function normalizeLink(value: string): string | null {
  const link = value.trim();
  if (!link) {
    return null;
  }

  if (link.startsWith("/")) {
    return link;
  }

  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function RichTextEditor({ name, initialHtml = "" }: { name: string; initialHtml?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function syncHtml() {
    if (editorRef.current && inputRef.current) {
      inputRef.current.value = editorRef.current.innerHTML;
    }
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  }

  function addLink() {
    const value = window.prompt(
      "ใส่ URL ภายใน เช่น /title/moana-1108427 หรือวาง URL เต็ม",
      "/title/"
    );
    if (value === null) {
      return;
    }

    const link = normalizeLink(value);
    if (!link) {
      window.alert("URL ไม่ถูกต้อง กรุณาใช้ /title/slug หรือ URL ที่ขึ้นต้นด้วย https://");
      return;
    }

    runCommand("createLink", link);
  }

  const buttonClass =
    "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-rose-500">
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50 p-2">
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")} className={buttonClass}>
          <strong>B</strong> ตัวหนา
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")} className={buttonClass}>
          <em>I</em> เอียง
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h2")} className={buttonClass}>
          H2
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h3")} className={buttonClass}>
          H3
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "p")} className={buttonClass}>
          ย่อหน้า
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertUnorderedList")} className={buttonClass}>
          • รายการ
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertOrderedList")} className={buttonClass}>
          1. รายการ
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className={buttonClass}>
          🔗 ใส่ลิงก์
        </button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("unlink")} className={buttonClass}>
          ตัดลิงก์
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncHtml}
        className="admin-rich-editor min-h-72 px-4 py-3 text-sm text-slate-900 outline-none"
        dangerouslySetInnerHTML={{ __html: initialHtml }}
      />
      <textarea ref={inputRef} name={name} defaultValue={initialHtml} className="hidden" aria-hidden="true" />
    </div>
  );
}
