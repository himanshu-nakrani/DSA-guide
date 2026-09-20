import { cn } from "@/lib/utils";

/**
 * A quiet paper-toned placeholder block. Purely decorative — hidden from the
 * accessibility tree and announced instead by route-level labels.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-rule/60", className)}
    />
  );
}
