"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-12 py-20">
      <div className="max-w-md w-full bloom">
        <div className="eyebrow mb-4" style={{ ["--i" as string]: 0 }}>
          <span className="text-[color:var(--ink-blue)] mr-2">§</span>
          Errata · An error slipped past the editor
        </div>
        <h1
          className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.06] font-medium text-[color:var(--ink)]"
          style={{ ["--i" as string]: 1 }}
        >
          The press jammed mid-print.
        </h1>
        <p
          className="text-[1.05rem] mt-4 leading-relaxed text-[color:var(--ink-soft)]"
          style={{ ["--i" as string]: 2 }}
        >
          Something went wrong rendering this page. The error has been logged.
          Try again, or return to the table of contents.
        </p>
        {error.digest && (
          <p className="font-mono text-[0.72rem] mt-3 text-muted-foreground">
            digest: {error.digest}
          </p>
        )}
        <div
          aria-hidden
          className="my-7 h-px bg-[color:var(--rule-strong)]"
          style={{ ["--i" as string]: 3 }}
        />
        <div
          className="flex flex-wrap items-center gap-3"
          style={{ ["--i" as string]: 4 }}
        >
          <button onClick={reset} className="btn-ink">
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link href="/learn" className="btn-ghost">
            Table of essays
          </Link>
        </div>
      </div>
    </div>
  );
}
