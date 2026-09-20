"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dsa.read";
const EVENT = "dsa:progress-change";

function readCount(slugs: string[]): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const set = new Set<string>(JSON.parse(raw) as string[]);
    let n = 0;
    for (const s of slugs) if (set.has(s)) n++;
    return n;
  } catch {
    return 0;
  }
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * "X of Y articles read" tally for the Learn listing header. Server snapshot
 * is 0 (no localStorage on the server); the count populates after hydration.
 */
export function ReadTally({ slugs }: { slugs: string[] }) {
  const count = useSyncExternalStore(
    subscribe,
    () => readCount(slugs),
    () => 0,
  );
  if (count === 0) return null;
  const pct = Math.round((count / Math.max(1, slugs.length)) * 100);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums"
      suppressHydrationWarning
    >
      <span className="font-semibold text-foreground">{count}</span>
      <span className="text-border-hover">/</span>
      <span>{slugs.length}</span>
      <span>read · {pct}%</span>
    </span>
  );
}
