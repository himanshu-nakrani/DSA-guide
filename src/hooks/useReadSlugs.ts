"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dsa.read";
const EVENT = "dsa:progress-change";

function readSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Subscribe to the client-side set of read article slugs. `ReadTracker`
 * fires the `dsa:progress-change` event after writing localStorage on
 * the same page, and the `storage` event carries the change across tabs.
 *
 * Replaces the previous module-scoped `useSyncExternalStore` cache, which
 * held a single `Set` instance shared by every `ReadBadge` mount and
 * could desync on cross-tab updates because the cached snapshot
 * identity was decoupled from the per-component subscription.
 */
export function useReadSlugs(): Set<string> {
  const [slugs, setSlugs] = useState<Set<string>>(() => readSlugs());

  useEffect(() => {
    const refresh = () => setSlugs(readSlugs());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return slugs;
}
