import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { accentClasses } from "@/lib/accent";
import { StarRating } from "@/components/site/StarRating";

export function PosterCard({ article, priority = false }: { article: ArticleSummary; priority?: boolean }) {
  const accent = accentClasses(article.category.accentColor);

  return (
    <Link href={`/title/${article.slug}`} prefetch={false} className="group flex flex-col">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--surface-muted)]">
        <Image
          src={article.coverImageUrl}
          alt={article.coverImageAlt}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-semibold text-white ${accent.badge}`}
        >
          {article.category.name}
        </span>
        {article.episodeLabel && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
            {article.episodeLabel}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
        {article.title}
      </p>
      {article.rating > 0 && <StarRating rating={article.rating} />}
    </Link>
  );
}
