"use client";

import { useEffect, useState } from "react";

/**
 * Thin reading-progress bar pinned to the top of the viewport. Computes
 * fraction read against the bounding box of the targeted element.
 */
export function ReadingProgress({ targetSelector }: { targetSelector: string }) {
  const [pct, setPct] = useState(0);

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
      setPct(scrolled / total);
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
  }, [targetSelector]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent"
    >
      <div
        className="h-full bg-primary will-change-[transform] origin-left"
        style={{
          transform: `scaleX(${pct})`,
          transition: "transform 80ms linear",
          boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 55%, transparent)",
        }}
      />
    </div>
  );
}
