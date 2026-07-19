import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

export function SeoContent({ heading, content }: { heading: string; content: string }) {
  const normalizedContent = content.trim();
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(normalizedContent);

  if (!normalizedContent) {
    return null;
  }

  return (
    <section className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[var(--ink)]">{heading}</h2>
      <div
        className={`seo-rich-content mt-4 text-sm leading-7 text-[var(--ink-muted)] sm:text-base ${
          containsHtml ? "" : "whitespace-pre-line"
        }`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(normalizedContent) }}
      />
    </section>
  );
}
