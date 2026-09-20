"use client";

import * as React from "react";
import { chipButtonVariants } from "@/components/ui/button";

/**
 * VizFrame — minimal figure chrome: neutral surface, hairline border,
 * small caption, optional controls.
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
  const frameLabel = caption?.trim() || "Interactive visualization";
  const displayCaption = caption?.trim() || "Figure";
  return (
    <div
      role="group"
      aria-label={frameLabel}
      className="border border-border overflow-hidden bg-surface-1"
      style={{
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex flex-col items-start gap-2 border-b border-border px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {displayCaption}
        </span>
        {controls ? (
          <div role="group" aria-label="Visualization controls" className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {controls}
          </div>
        ) : null}
      </div>
      <div
        className="min-w-0 overflow-x-auto px-5 py-5"
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
  ariaLabel,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel ?? title}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active === undefined ? undefined : active}
      className={chipButtonVariants({ active: Boolean(active) })}
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
  const reducedMotion = usePrefersReducedMotion();
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  React.useEffect(() => {
    if (!active || reducedMotion || hidden) return;
    const id = window.setInterval(() => cbRef.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs, reducedMotion, hidden]);
}

/**
 * usePrefersReducedMotion — true when the user has the OS-level reduced-motion
 * preference set. Returns false on the server and on the very first client
 * paint so SSR markup matches; flips to the real value after mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Theme palette. Every slot resolves through a CSS variable so the
 * colours track light/dark. The slots are *semantic*, not just a rainbow:
 *
 *   c1  — primary ink (deep blue): "active / selected" cells, "visited" nodes,
 *         the main highlight in a diagram.
 *   c2  — softer blue: a secondary-but-still-on-theme accent.
 *   c3  — ochre highlight: marks the *current* step in a sequence. Warm so it
 *         reads like a pencil mark next to the blue, not a second alarm.
 *   c4  — pitfall red: errors, collisions, the "danger" state.
 *   c5  — pencil muted: dim / inert / "eliminated" state.
 *
 * If you're picking a colour and none of those semantics fit, you're
 * inventing a fourth ink — push back on the diagram instead.
 */
export const PALETTE = {
  ink: "var(--ink)",
  paper: "var(--paper)",
  muted: "var(--pencil)",
  border: "var(--rule-strong)",
  primary: "var(--ink-blue)",
  destructive: "var(--ink-red)",
  c1: "var(--ink-blue)",
  c2: "var(--ink-blue-soft)",
  c3: "var(--ink-ochre)",
  c4: "var(--ink-red)",
  c5: "var(--pencil)",
};
