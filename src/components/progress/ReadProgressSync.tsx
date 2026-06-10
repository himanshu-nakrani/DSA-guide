"use client";

import { useEffect } from "react";

const STORAGE_KEY = "dsa.read";
const EVENT = "dsa:progress-change";

export function ReadProgressSync({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      let changed = false;
      for (const slug of slugs) {
        if (!existing.has(slug)) {
          existing.add(slug);
          changed = true;
        }
      }
      if (!changed) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(existing)));
      window.dispatchEvent(new CustomEvent(EVENT));
    } catch {
      // ignore storage errors
    }
  }, [slugs]);

  return null;
}
