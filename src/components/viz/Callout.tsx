"use client";

import * as React from "react";

/**
 * Callout: editorial side-note with a labeled tone. Used for "Pitfall",
 * "Intuition", "Why this works", etc. Plain text body; markdown not parsed.
 */
const TONE_COLORS: Record<string, { border: string; bg: string; label: string }> = {
  intuition: {
    border: "var(--primary)",
    bg: "oklch(0.42 0.08 145 / 0.06)",
    label: "var(--primary)",
  },
  pitfall: {
    border: "var(--destructive)",
    bg: "oklch(0.45 0.16 25 / 0.05)",
    label: "var(--destructive)",
  },
  insight: {
    border: "oklch(0.65 0.10 60)",
    bg: "oklch(0.65 0.10 60 / 0.08)",
    label: "oklch(0.45 0.10 60)",
  },
  note: {
    border: "var(--border)",
    bg: "transparent",
    label: "var(--muted-foreground)",
  },
};

export function Callout({
  tone = "note",
  title,
  body,
}: {
  tone?: keyof typeof TONE_COLORS;
  title?: string;
  body?: string;
}) {
  const c = TONE_COLORS[tone] ?? TONE_COLORS.note;
  return (
    <aside
      className="my-6 p-4"
      style={{
        borderLeft: `3px solid ${c.border}`,
        background: c.bg,
      }}
    >
      {title && (
        <div
          className="font-mono text-[0.65rem] uppercase tracking-[0.16em] mb-1"
          style={{ color: c.label }}
        >
          {title}
        </div>
      )}
      <div className="font-serif text-[0.95rem] leading-relaxed">{body}</div>
    </aside>
  );
}
