function Star({ fill, sizeClass }: { fill: number; sizeClass: string }) {
  return (
    <span className={`relative inline-block ${sizeClass}`}>
      <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full text-white/20" fill="currentColor">
        <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
      </svg>
      {fill > 0 && (
        <svg
          viewBox="0 0 20 20"
          className="absolute inset-0 h-full w-full text-amber-400"
          fill="currentColor"
          style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      )}
    </span>
  );
}

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const clamped = Math.min(5, Math.max(0, rating));
  const stars = Array.from({ length: 5 }, (_, i) => Math.min(1, Math.max(0, clamped - i)));
  const sizeClass = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div className={`flex items-center gap-1 ${size === "md" ? "text-sm" : "text-xs"}`}>
      <div className="flex gap-0.5">
        {stars.map((fill, i) => (
          <Star key={i} fill={fill} sizeClass={sizeClass} />
        ))}
      </div>
      <span className="font-semibold text-[var(--ink)]">{clamped.toFixed(1)}</span>
    </div>
  );
}
