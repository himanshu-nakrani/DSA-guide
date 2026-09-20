"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type Hint = { id: string; order: number; content: string };

/**
 * HintList — progressive-disclosure hints. Every hint starts obscured (a
 * blurred "spoiler" plate) so glancing at the page never gives the answer
 * away; revealing is an explicit per-hint action.
 */
export function HintList({ hints }: { hints: Hint[] }) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ol className="space-y-3">
      {hints.map((hint) => {
        const revealed = revealedIds.has(hint.id);
        return (
          <li key={hint.id} className="rounded-xl border border-rule overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(hint.id)}
              aria-expanded={revealed}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors",
                revealed ? "hover:bg-surface-2" : "hover:bg-ink-blue-wash",
              )}
            >
              <span className="font-mono text-caption text-ink-blue tabular-nums">
                {String(hint.order).padStart(2, "0")}
              </span>
              <span className="flex-1 text-small font-medium text-muted-foreground">
                {revealed ? `Hint ${hint.order}` : `Reveal hint ${hint.order}`}
              </span>
              {revealed ? (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              ) : (
                <Eye className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </button>
            {revealed && (
              <p className="px-4 pb-4 pt-1 leading-relaxed border-t border-rule bg-surface-1">
                {hint.content}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
