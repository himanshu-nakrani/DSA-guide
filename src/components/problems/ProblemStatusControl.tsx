"use client";

import { useState, useTransition } from "react";
import { ProgressStatus } from "@/generated/prisma";
import { progressLabel, progressOptions } from "@/components/problems/problem-ui";

export function ProblemStatusControl({
  slug,
  initialStatus,
  signedIn,
}: {
  slug: string;
  initialStatus: ProgressStatus;
  signedIn: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (next: ProgressStatus) => {
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/progress/problem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, status: next }),
      });
      if (!res.ok) {
        setStatus(prev);
        setError("Could not save progress.");
      }
    });
  };

  if (!signedIn) {
    return (
      <p className="text-xs text-muted-foreground">
        <a href="/auth" className="link-quill">Sign in</a> to save problem progress.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <span id="progress-label" className="block text-xs font-mono uppercase tracking-[0.12em] text-muted-foreground">
        Progress
      </span>
      <div role="group" aria-labelledby="progress-label" className="flex flex-wrap gap-2">
        {progressOptions.map((option) => {
          const active = option === status;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              disabled={isPending}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-[color:var(--ink-blue)] bg-[color:var(--ink-blue-wash)] text-[color:var(--ink-blue)]"
                  : "border-[color:var(--rule)] text-muted-foreground hover:text-foreground"
              } ${isPending ? "opacity-70" : ""}`}
            >
              {progressLabel[option]}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  );
}
