"use client";

import * as React from "react";

/**
 * Common chrome around a visualization: rounded card, soft shadow, caption,
 * optional controls slot. Modern-SaaS aesthetic.
 */
export function VizFrame({
  caption,
  children,
  controls,
  height,
}: {
  caption?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  height?: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between gap-3">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.04em] text-muted-foreground">
          {caption ?? "Figure"}
        </span>
        {controls ? <span className="flex items-center gap-2">{controls}</span> : null}
      </div>
      <div
        className="px-5 py-5"
        style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
      >
        {children}
      </div>
    </div>
  );
}

export function VizButton({
  onClick,
  disabled,
  children,
  title,
  active,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`font-mono text-[0.7rem] uppercase tracking-[0.04em] px-2.5 py-1 rounded-md border transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-accent hover:text-accent-foreground"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export function useTicker(active: boolean, intervalMs: number, onTick: () => void) {
  const cbRef = React.useRef(onTick);
  React.useEffect(() => {
    cbRef.current = onTick;
  }, [onTick]);
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => cbRef.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
}

/** Indigo-led palette for SVG fills/strokes, matched to the SaaS theme. */
export const PALETTE = {
  ink: "var(--foreground)",
  paper: "var(--background)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
  primary: "var(--primary)",
  destructive: "var(--destructive)",
  c1: "oklch(0.55 0.20 270)", // indigo (primary)
  c2: "oklch(0.65 0.16 165)", // teal
  c3: "oklch(0.70 0.16 65)",  // amber
  c4: "oklch(0.58 0.22 27)",  // red
  c5: "oklch(0.55 0.16 320)", // violet
};
