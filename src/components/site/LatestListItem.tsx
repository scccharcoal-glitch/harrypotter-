import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { formatThaiDate } from "@/lib/format-date";

export function LatestListItem({ article }: { article: ArticleSummary }) {
  return (
    <Link href={`/title/${article.slug}`} prefetch={false} className="group flex items-center gap-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        <Image src={article.coverImageUrl} alt={article.coverImageAlt} fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
          {article.title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {formatThaiDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
