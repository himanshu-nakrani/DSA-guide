"use client";

import { useScrollFraction } from "@/hooks/useScrollFraction";

/**
 * Thin reading-progress bar pinned to the top of the viewport. Uses the
 * shared `useScrollFraction` hook so the bar and the running time chip
 * (`ReadingChip`) don't each attach their own scroll listener.
 */
export function ReadingProgress({ targetSelector }: { targetSelector: string }) {
  const fraction = useScrollFraction(targetSelector);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent"
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
