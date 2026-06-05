export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
      <div className="bloom mb-12 animate-pulse">
        <div
          className="eyebrow mb-4 text-[color:var(--pencil)]"
          style={{ ["--i" as string]: 0 }}
        >
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Setting type…
        </div>
        <div
          className="h-12 md:h-14 w-3/4 rounded-sm bg-[color:var(--surface-2)]"
          style={{ ["--i" as string]: 1 }}
        />
        <div
          className="h-4 mt-5 w-2/3 rounded-sm bg-[color:var(--surface-2)]"
          style={{ ["--i" as string]: 2 }}
        />
        <div
          aria-hidden
          className="mt-6 h-px bg-[color:var(--rule-strong)]"
          style={{ ["--i" as string]: 3 }}
        />
      </div>
      <div className="space-y-4 animate-pulse" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-sm border border-[color:var(--rule)] bg-[color:var(--surface-1)]"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
