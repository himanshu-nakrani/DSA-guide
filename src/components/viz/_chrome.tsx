"use client";

import * as React from "react";

/**
 * Common chrome around a visualization: a thin border, caption, optional controls slot.
 * Keeps the article's editorial feel intact (cards with hairline borders, smallcaps caption).
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
    <div className="border border-border bg-card">
      <div className="px-4 pt-4 pb-2 text-[0.7rem] font-mono uppercase tracking-[0.16em] text-muted-foreground flex items-center justify-between gap-3">
        <span>{caption ?? "Figure"}</span>
        {controls ? <span className="flex items-center gap-2">{controls}</span> : null}
      </div>
      <div
        className="px-4 pb-4 pt-2"
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
      className={`font-mono text-[0.65rem] uppercase tracking-[0.12em] px-2 py-1 border ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background hover:bg-accent"
      } disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
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

/** Editorial color palette, matched to the article CSS variables. */
export const PALETTE = {
  ink: "var(--foreground)",
  paper: "var(--background)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
  primary: "var(--primary)",
  destructive: "var(--destructive)",
  // Direct OKLCH values for SVG fills/strokes; these match the chart-* tokens.
  c1: "oklch(0.42 0.08 145)", // moss-green (primary)
  c2: "oklch(0.55 0.06 145)",
  c3: "oklch(0.65 0.10 60)", // amber
  c4: "oklch(0.45 0.16 25)", // brick
  c5: "oklch(0.40 0.10 250)", // ink-blue
};
