export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-16 md:py-20">
      <div className="mb-12 animate-pulse">
        <div className="mb-3 h-3 w-20 rounded bg-surface-2" />
        <div className="h-12 w-3/4 max-w-full rounded-lg bg-surface-2" />
        <div className="mt-4 h-5 w-2/3 max-w-full rounded bg-surface-2" />
      </div>
      <div className="space-y-4 animate-pulse" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl border border-border bg-surface-1"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
