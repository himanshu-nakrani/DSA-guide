"use client";

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";

const STORAGE_KEY = "dsa.read";
const EVENT = "dsa:progress-change";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// useSyncExternalStore needs a snapshot reference identity that's stable
// between calls unless the underlying data changed. We serialize the set
// to a sorted string and cache the corresponding Set instance.
let cachedKey: string | null = null;
let cachedSet: Set<string> = new Set();

function getSnapshot(): Set<string> {
  if (typeof window === "undefined") return cachedSet;
  const next = readSet();
  const key = Array.from(next).sort().join("|");
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSet = next;
  }
  return cachedSet;
}

function getServerSnapshot(): Set<string> {
  return cachedSet;
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
 * Renders a small "✓ Read" pencil-grey marker if the given article slug is
 * present in localStorage's dsa.read set. ReadTracker writes that set on
 * each article visit; this is the read-side companion.
 */
export function ReadBadge({ slug }: { slug: string }) {
  const set = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!set.has(slug)) return null;
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
