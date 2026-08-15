"use client";

import { useEffect, useState } from "react";

/**
 * Track the vertical scroll fraction of a target element relative to the
 * viewport. Returns a number in `[0, 1]`:
 *
 * - `0` while the target is fully below the bottom of the viewport (or the
 *   top is below the top of the viewport and the element is taller than
 *   the viewport).
 * - `1` once the bottom of the target has scrolled past the bottom of the
 *   viewport.
 *
 * Used by `ReadingProgress` (top bar) and `ReadingChip` (running time),
 * which previously each ran their own scroll listener with identical
 * math. With this hook, both components share a single listener per
 * selector.
 *
 * Implementation notes:
 * - Listens to `scroll` and `resize` on `window`, both passive.
 * - Coalesces updates with `requestAnimationFrame` so we run at most one
 *   `getBoundingClientRect` per frame.
 * - The cleanup cancels the pending rAF and removes both listeners, so
 *   unmounting either consumer does not leak a listener on `window`.
 */
export function useScrollFraction(targetSelector: string): number {
  const [fraction, setFraction] = useState(0);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      if (total <= 0) {
        // Element is shorter than the viewport. Treat "fully read" only
        // once its top has scrolled above the viewport top.
        setFraction(rect.top <= 0 ? 1 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setFraction(scrolled / total);
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

  return fraction;
}
