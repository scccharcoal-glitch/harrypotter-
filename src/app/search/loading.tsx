export default function SearchLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="mb-7 h-8 w-64 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-[var(--surface-muted)]" />
            <div className="mt-2 h-4 rounded bg-[var(--surface-muted)]" />
          </div>
        ))}
      </div>
    </main>
  );
}
