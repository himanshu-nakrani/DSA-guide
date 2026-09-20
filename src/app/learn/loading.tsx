import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-16 md:py-20">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-11 md:h-12 w-3/4 max-w-full" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <div className="mt-10 space-y-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl border border-border" />
        ))}
      </div>
    </div>
  );
}
