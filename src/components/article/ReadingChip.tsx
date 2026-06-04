"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * Live "X / Y min" chip pinned in the article running header. Tracks the
 * same target as ReadingProgress and multiplies completion fraction by the
 * total estimated minutes from the page metadata, so a 12-minute article
 * shows "0 / 12m" at the top and ticks up as the reader scrolls.
 *
 * Renders nothing until first scroll (no point showing "0 / 12m" before the
 * reader has moved) to keep the running header quiet on first paint.
 */
export function ReadingChip({
  targetSelector,
  totalMins,
}: {
  targetSelector: string;
  totalMins: number;
}) {
  const [pct, setPct] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      if (total <= 0) {
        setPct(rect.top <= 0 ? 1 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const next = scrolled / total;
      setPct(next);
      if (!started && next > 0.01) setStarted(true);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetSelector, started]);

  const elapsed = Math.min(totalMins, Math.round(pct * totalMins));

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
