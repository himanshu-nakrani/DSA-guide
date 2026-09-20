import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-16 md:py-20 space-y-10">
      <header className="mb-10 md:mb-12">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-11 md:h-12 w-72 max-w-full" />
        <Skeleton className="h-5 w-[26rem] max-w-full mt-4" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-16 flex-1 rounded-[var(--radius-md)] border border-rule" />
          <Skeleton className="h-16 flex-1 rounded-[var(--radius-md)] border border-rule" />
        </div>
      </header>

      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-52 rounded-[var(--radius-md)] border border-rule" />
        ))}
      </div>
    </div>
  );
}
