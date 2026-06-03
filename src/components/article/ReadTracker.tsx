"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dsa.read";

/**
 * Marks the given article slug as read on mount. Fires a `dsa:progress-change`
 * event so other tabs/components can react.
 */
export function ReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      if (set.has(slug)) return;
      set.add(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
      window.dispatchEvent(new CustomEvent("dsa:progress-change"));
    } catch {
      // ignore quota / disabled storage
    }
  }, [slug]);
  return null;
}
