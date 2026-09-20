import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-20 space-y-10 md:space-y-12">
      <header className="mb-10 md:mb-12">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-11 md:h-12 w-96 max-w-full" />
        <Skeleton className="h-5 w-[28rem] max-w-full mt-4" />
      </header>

      <section className="surface-card overflow-hidden grid grid-cols-2 xl:grid-cols-4 gap-px bg-border">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-none border-0" />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-28 rounded-[var(--radius-md)] border border-rule" />
        <Skeleton className="h-28 rounded-[var(--radius-md)] border border-rule" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Skeleton className="h-72 rounded-[var(--radius-md)] border border-rule" />
        <Skeleton className="h-72 rounded-[var(--radius-md)] border border-rule" />
      </section>
    </div>
  );
}
