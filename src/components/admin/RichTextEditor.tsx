"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EditorMode = "document" | "html" | "preview";

function normalizeLink(value: string): string | null {
  const link = value.trim();
  if (!link) return null;
  if (link.startsWith("/")) return link;

  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function countText(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&#39;|&quot;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    words: text ? text.split(" ").length : 0,
    characters: text.length,
  };
}

export function RichTextEditor({ name, initialHtml = "" }: { name: string; initialHtml?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialHtml);
  const [mode, setMode] = useState<EditorMode>("document");
  const counts = useMemo(() => countText(html), [html]);

  useEffect(() => {
    if (mode === "document" && editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html, mode]);

  function syncHtml() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  }

  function addLink() {
    const value = window.prompt("ใส่ URL ภายใน เช่น /title/slug หรือวาง URL เต็ม", "/title/");
    if (value === null) return;

    const link = normalizeLink(value);
    if (!link) {
      window.alert("URL ไม่ถูกต้อง กรุณาใช้ URL ภายในที่ขึ้นต้นด้วย / หรือ URL https://");
      return;
    }
    runCommand("createLink", link);
  }

  function addImage() {
    const value = window.prompt("วาง URL รูปภาพที่ต้องการแทรกในเนื้อหา", "https://");
    if (value === null) return;

    const imageUrl = normalizeLink(value);
    if (!imageUrl) {
      window.alert("URL รูปภาพไม่ถูกต้อง");
      return;
    }
    runCommand("insertImage", imageUrl);
  }

  const toolbarButton =
    "whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700";
  const modeButton = (value: EditorMode) =>
    `rounded-full px-4 py-2 text-sm font-bold transition ${
      mode === value ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          เลือกข้อความแล้วกดหัวข้อ ตัวหนา รายการ หรือลิงก์ รูปแบบจะแสดงในเอกสารทันที
        </p>
        <div className="flex w-fit rounded-full border border-slate-200 bg-slate-50 p-1">
          <button type="button" onClick={() => setMode("document")} className={modeButton("document")}>
            เอกสาร
          </button>
          <button type="button" onClick={() => setMode("html")} className={modeButton("html")}>
            HTML
          </button>
          <button type="button" onClick={() => setMode("preview")} className={modeButton("preview")}>
            ตัวอย่าง
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100">
        {mode === "document" && (
          <>
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3">
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")} className={toolbarButton}>
                ตัวหนา
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")} className={toolbarButton}>
                ตัวเอียง
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h2")} className={toolbarButton}>
                H2
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "h3")} className={toolbarButton}>
                H3
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "p")} className={toolbarButton}>
                ย่อหน้า
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertUnorderedList")} className={toolbarButton}>
                • รายการ
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("insertOrderedList")} className={toolbarButton}>
                1. รายการ
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("formatBlock", "blockquote")} className={toolbarButton}>
                คำพูด
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addLink} className={toolbarButton}>
                ใส่ลิงก์
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("unlink")} className={toolbarButton}>
                ล้างลิงก์
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={addImage} className={toolbarButton}>
                แทรกรูปภาพ
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("undo")} className={toolbarButton}>
                ย้อนกลับ
              </button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("redo")} className={toolbarButton}>
                ทำซ้ำ
              </button>
            </div>
            <div className="bg-slate-100 p-4 sm:p-8">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncHtml}
                className="admin-rich-editor mx-auto min-h-[28rem] max-w-4xl bg-white px-6 py-8 text-base text-slate-900 shadow-sm outline-none sm:px-12 sm:py-12"
              />
            </div>
          </>
        )}

        {mode === "html" && (
          <textarea
            value={html}
            onChange={(event) => setHtml(event.target.value)}
            spellCheck={false}
            className="min-h-[34rem] w-full resize-y bg-slate-950 p-5 font-mono text-sm leading-7 text-slate-100 outline-none"
            aria-label="แก้ไข HTML"
          />
        )}

        {mode === "preview" && (
          <div className="min-h-[34rem] bg-slate-100 p-4 sm:p-8">
            <iframe
              title="ตัวอย่างบทความ"
              sandbox=""
              srcDoc={`<!doctype html><html lang="th"><head><meta charset="utf-8"><style>
                body{margin:0;padding:48px;font-family:Arial,sans-serif;color:#334155;font-size:17px;line-height:1.9}
                h2,h3{color:#0f172a;line-height:1.4;margin-top:2rem}h2{font-size:1.6rem}h3{font-size:1.3rem}
                img{display:block;max-width:100%;height:auto;border-radius:12px;margin:1.25rem 0}
                a{color:#e11d48}blockquote{margin:1.25rem 0;border-left:4px solid #e11d48;background:#fff1f2;padding:1rem 1.25rem}
                @media(max-width:640px){body{padding:24px}}
              </style></head><body>${html}</body></html>`}
              className="mx-auto min-h-[30rem] w-full max-w-4xl border-0 bg-white shadow-sm"
            />
          </div>
        )}

        <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-400">
          {counts.words.toLocaleString("th-TH")} คำ · {counts.characters.toLocaleString("th-TH")} ตัวอักษร
        </div>
      </div>

      <textarea name={name} value={html} readOnly hidden />
    </div>
  );
}
