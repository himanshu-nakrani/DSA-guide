"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProgressStatus } from "@/generated/prisma";
import { progressLabel, progressOptions } from "@/components/problems/problem-ui";

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
      <Link href="/auth" className="text-xs text-muted-foreground hover:text-[color:var(--ink-blue)]">
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
            if (!res.ok) setStatus(prev);
          });
        }}
        className="rounded-sm border border-[color:var(--rule)] bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-[color:var(--ink-blue)] disabled:opacity-60"
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

