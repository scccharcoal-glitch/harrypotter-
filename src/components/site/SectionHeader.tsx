import Link from "next/link";
import { accentClasses } from "@/lib/accent";

export function SectionHeader({
  title,
  href,
  accentColor = "red",
}: {
  title: string;
  href: string;
  accentColor?: string;
}) {
  const accent = accentClasses(accentColor);

  return (
    <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-2">
      <h2 className={`border-l-4 pl-3 text-lg font-bold text-[var(--ink)] ${accent.border}`}>{title}</h2>
      <Link href={href} prefetch={false} className={`text-sm font-medium ${accent.text} hover:underline`}>
        ดูทั้งหมด
      </Link>
    </div>
  );
}
