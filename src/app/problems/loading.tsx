import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 md:py-20">
      <header className="mb-10 md:mb-12">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-11 md:h-12 w-80 max-w-full" />
        <Skeleton className="h-5 w-[28rem] max-w-full mt-4" />
      </header>

      <Skeleton className="h-44 rounded-[var(--radius-md)] border border-rule mb-8" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-[var(--radius-md)] border border-rule" />
        ))}
      </div>
    </div>
  );
}
