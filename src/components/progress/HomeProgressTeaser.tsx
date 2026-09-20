"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "dsa.read";
const EVENT = "dsa:progress-change";

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
 * Snapshot is a plain string ("read|firstUnread") so identity stays stable
 * across calls — useSyncExternalStore requires referential equality.
 */
function makeSnapshot(slugs: string[]) {
  return () => {
    if (typeof window === "undefined") return "0|";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const read = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      let count = 0;
      let firstUnread = "";
      for (const slug of slugs) {
        if (read.has(slug)) count += 1;
        else if (!firstUnread) firstUnread = slug;
      }
      return `${count}|${firstUnread}`;
    } catch {
      return "0|";
    }
  };
}

/**
 * HomeProgressTeaser — a returning-reader strip on the home page. Reads
 * local article progress (works signed-out), links straight to the next
 * unread article, and stays invisible until there is something to show.
 */
export function HomeProgressTeaser({ slugs }: { slugs: string[] }) {
  const snapshot = useSyncExternalStore(subscribe, makeSnapshot(slugs), () => "0|");
  const [countStr, firstUnread] = snapshot.split("|");
  const count = Number.parseInt(countStr, 10) || 0;
  if (count === 0) return null;

  const pct = Math.round((count / Math.max(1, slugs.length)) * 100);

  return (
    <div className="surface-card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold tabular-nums text-foreground">{count}</span>
        {" "}of{" "}
        <span className="tabular-nums">{slugs.length}</span>{" "}
        articles read · <span className="tabular-nums">{pct}%</span> complete
      </p>
      <Link
        href={firstUnread ? `/learn/${firstUnread}` : "/learn"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-blue hover:underline"
      >
        {firstUnread ? "Continue reading" : "Revisit the library"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
