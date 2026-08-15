"use client";

import { Check } from "lucide-react";
import { useReadSlugs } from "@/hooks/useReadSlugs";

/**
 * Renders a small "✓ Read" pencil-grey marker if the given article slug is
 * present in localStorage's dsa.read set. `ReadTracker` writes that set on
 * each article visit and fires `dsa:progress-change`; `useReadSlugs`
 * subscribes and re-renders this component on change.
 */
export function ReadBadge({ slug }: { slug: string }) {
  const slugs = useReadSlugs();
  if (!slugs.has(slug)) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.62rem] font-mono uppercase tracking-[0.12em] text-[color:var(--pencil)]"
      title="You've read this article"
      aria-label="Read"
      suppressHydrationWarning
    >
      <Check className="h-3 w-3" strokeWidth={1.8} />
      Read
    </span>
  );
}
