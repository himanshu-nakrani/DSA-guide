"use client";

import { useScrollFraction } from "@/hooks/useScrollFraction";

/**
 * Thin reading-progress bar pinned to the top of the viewport. Uses the
 * shared `useScrollFraction` hook so the bar and the running time chip
 * (`ReadingChip`) don't each attach their own scroll listener.
 */
export function ReadingProgress({ targetSelector }: { targetSelector: string }) {
  const fraction = useScrollFraction(targetSelector);

  const percentage = Math.round(fraction * 100);

  return (
    <div
      role="progressbar"
      aria-label="Article reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className="fixed left-0 right-0 top-0 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full will-change-[transform] origin-left"
        style={{
          background: "var(--ink-blue)",
          transform: `scaleX(${fraction})`,
          transition: "transform 80ms linear",
        }}
      />
    </div>
  );
}
