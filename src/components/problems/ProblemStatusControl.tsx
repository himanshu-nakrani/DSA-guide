"use client";

import { useState, useTransition } from "react";
import { ProgressStatus } from "@/generated/prisma";
import { progressLabel, progressOptions } from "@/components/problems/problem-ui";
import { toast } from "@/components/ui/toast";

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
        toast("Couldn't save the status", { tone: "error" });
      } else {
        toast(
          next === ProgressStatus.NEW
            ? "Progress reset"
            : `Marked as ${progressLabel[next].toLowerCase()}`,
          { key: "problem-status" },
        );
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
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)] ${
                active
                  ? "border-ink-blue bg-ink-blue-wash text-ink-blue"
                  : "border-rule text-muted-foreground hover:text-foreground"
              } ${isPending ? "opacity-70" : ""}`}
            >
              {progressLabel[option]}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-ink-red">{error}</p>}
    </div>
  );
}
