"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

/**
 * Sticky right-rail table of contents. Tracks the section the reader is in
 * via IntersectionObserver and highlights it with an inline indicator.
 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Track the topmost heading that has scrolled past a band near the top of
    // the viewport. We watch the entire band so the active state updates as
    // soon as a new section starts, not when it finishes.
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.boundingClientRect.top);
          } else {
            visible.delete(e.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the heading closest to (but above) the viewport band's top.
        const sorted = Array.from(visible.entries()).sort((a, b) => a[1] - b[1]);
        setActiveId(sorted[0][0]);
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 1],
      },
    );
    observerRef.current = obs;

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) obs.observe(el);
    }

    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-2">
      <div className="eyebrow">On this page</div>
      <ol className="space-y-0.5 border-l border-[color:var(--rule)]">
        {items.map((item, i) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative block pl-4 -ml-px py-1 text-[0.8rem] leading-snug border-l transition-colors ${
                  isActive
                    ? "text-[color:var(--ink-blue)] border-l-[color:var(--ink-blue)] font-medium"
                    : "text-muted-foreground border-l-transparent hover:text-[color:var(--ink-blue)]"
                }`}
              >
                <span className="font-mono text-[0.6rem] text-muted-foreground/70 mr-1.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
