import { Skeleton } from "@/components/ui/skeleton";

export default function ListsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-20 space-y-10">
      <header className="mb-10 md:mb-12">
        <Skeleton className="h-3 w-16 mb-3" />
        <Skeleton className="h-11 md:h-12 w-80 max-w-full" />
        <Skeleton className="h-5 w-[24rem] max-w-full mt-4" />
      </header>

      <Skeleton className="h-32 surface-card" />

      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-[var(--radius-md)] border border-rule" />
          ))}
        </div>
      </section>
    </div>
  );
}
