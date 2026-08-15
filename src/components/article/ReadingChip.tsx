"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useScrollFraction } from "@/hooks/useScrollFraction";

/**
 * Live "X / Y min" chip pinned in the article running header. Uses the
 * shared `useScrollFraction` hook so it doesn't attach a second scroll
 * listener alongside `ReadingProgress`. Multiplies the completion
 * fraction by the article's estimated minutes to render the chip.
 *
 * Renders at half-opacity until the reader has scrolled past 1% of the
 * target, so the running header doesn't show "0 / 12m" on first paint.
 */
export function ReadingChip({
  targetSelector,
  totalMins,
}: {
  targetSelector: string;
  totalMins: number;
}) {
  const fraction = useScrollFraction(targetSelector);
  const [started, setStarted] = useState(false);

  if (!started && fraction > 0.01) {
    // Render-state flag, not a dependency: we don't want a setState in an
    // effect just to flip a one-time class.
    setStarted(true);
  }

  const elapsed = Math.min(totalMins, Math.round(fraction * totalMins));

  return (
    <span
      className="hidden md:inline-flex items-center gap-1 text-[0.7rem] font-mono text-muted-foreground tabular-nums transition-opacity"
      style={{ opacity: started ? 1 : 0.45 }}
      aria-live="polite"
      aria-label={`Reading progress: ${elapsed} of ${totalMins} minutes`}
    >
      <Clock className="h-3 w-3" />
      <span className="text-[color:var(--ink-blue)]">{elapsed}</span>
      <span className="text-muted-foreground/60">/</span>
      <span>{totalMins}m</span>
    </span>
  );
}
