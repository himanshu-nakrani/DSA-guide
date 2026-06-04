"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const STORAGE_KEY = "dsa.read";

function readSet(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

/**
 * Circular node showing module order plus a progress ring derived from how
 * many of the module's articles the reader has visited. Marks the module as
 * complete when all its slugs are in the read set.
 */
export function ProgressNode({
  order,
  slugs,
}: {
  order: number;
  slugs: string[];
}) {
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    const recompute = () => {
      if (slugs.length === 0) return setReadCount(0);
      const set = readSet();
      let n = 0;
      for (const s of slugs) if (set.has(s)) n += 1;
      setReadCount(n);
    };
    recompute();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) recompute();
    };
    const onCustom = () => recompute();
    window.addEventListener("storage", onStorage);
    window.addEventListener("dsa:progress-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dsa:progress-change", onCustom as EventListener);
    };
  }, [slugs]);

  const total = slugs.length;
  const complete = total > 0 && readCount === total;
  const inProgress = readCount > 0 && !complete;
  const pct = total === 0 ? 0 : readCount / total;

  const size = 40;
  const r = 18;
  const C = 2 * Math.PI * r;
  const dash = C * pct;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        {inProgress && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.85"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeDasharray={`${dash} ${C}`}
            style={{ transition: "stroke-dasharray 480ms var(--ease-out)" }}
          />
        )}
      </svg>
      <div
        className={`relative h-10 w-10 rounded-full grid place-items-center font-mono text-sm font-medium tabular-nums shrink-0 transition-colors ${
          complete
            ? "bg-primary text-primary-foreground border border-primary"
            : inProgress
              ? "bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary border border-[color:color-mix(in_srgb,var(--primary)_30%,transparent)]"
              : "bg-[color:var(--surface-1,var(--card))] text-muted-foreground border border-border"
        }`}
      >
        {complete ? (
          <Check className="h-4 w-4" strokeWidth={2.25} />
        ) : (
          String(order).padStart(2, "0")
        )}
      </div>
    </div>
  );
}
