"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProgressStatus } from "@/generated/prisma";
import { progressLabel, progressOptions } from "@/components/problems/problem-ui";
import { toast } from "@/components/ui/toast";

export function ProblemQuickStatusSelect({
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

  if (!signedIn) {
    return (
      <Link href="/auth" className="text-xs text-muted-foreground hover:text-ink-blue">
        Sign in to track
      </Link>
    );
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-mono uppercase tracking-[0.1em]">Status</span>
      <select
        value={status}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value as ProgressStatus;
          const prev = status;
          setStatus(next);
          startTransition(async () => {
            const res = await fetch("/api/progress/problem", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ slug, status: next }),
            });
            if (!res.ok) {
              setStatus(prev);
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
        }}
        className="min-h-[44px] sm:min-h-[32px] rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-ink-blue disabled:opacity-60"
      >
        {progressOptions.map((option) => (
          <option key={option} value={option}>
            {progressLabel[option]}
          </option>
        ))}
      </select>
    </label>
  );
}

