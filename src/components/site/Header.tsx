import Link from "next/link";
import type { Category } from "@/lib/types";

export function Header({ categories, searchQuery = "" }: { categories: Category[]; searchQuery?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-1 text-xl font-bold">
          <span aria-hidden="true" className="text-[var(--brand)]">⚡</span>
          <span className="text-[var(--brand)]">ดูแฮร์รี่</span>
          <span>พอตเตอร์</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              prefetch={false}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/characters"
            prefetch={false}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            ตัวละคร
          </Link>
          <Link
            href="/blog"
            prefetch={false}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            บทความ
          </Link>
        </nav>

        <form
          action="/search"
          method="get"
          role="search"
          className="flex w-44 items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] transition-colors focus-within:border-[var(--brand)] sm:w-64"
        >
          <label htmlFor="site-search" className="sr-only">
            ค้นหาภาพยนตร์แฮร์รี่ พอตเตอร์
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={searchQuery}
            placeholder="ค้นหาภาพยนตร์..."
            className="min-w-0 flex-1 bg-transparent py-2 pl-4 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
          />
          <button
            type="submit"
            aria-label="ค้นหา"
            className="mr-1 flex h-8 w-8 flex-none items-center justify-center rounded-full text-[var(--ink-muted)] transition-colors hover:bg-[var(--brand)] hover:text-white"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-[var(--border)] px-4 py-2 md:hidden">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            prefetch={false}
            className="whitespace-nowrap rounded-full px-3 py-1 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            {category.name}
          </Link>
        ))}
        <Link
          href="/characters"
          prefetch={false}
          className="whitespace-nowrap rounded-full px-3 py-1 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
        >
          ตัวละคร
        </Link>
        <Link
          href="/blog"
          prefetch={false}
          className="whitespace-nowrap rounded-full px-3 py-1 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
        >
          บทความ
        </Link>
      </nav>
    </header>
  );
}
