"use client";

import * as React from "react";

/**
 * VizFrame — printed-figure chrome: paper-toned surface, ruled border, a
 * "Figure" small-cap caption, optional controls slot in the running head.
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
    <div
      className="border border-[color:var(--rule-strong)] overflow-hidden"
      style={{
        background: "var(--surface-1)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        className="px-4 py-2 border-b border-[color:var(--rule)] flex items-center justify-between gap-3"
        style={{ background: "var(--surface-2)" }}
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[color:var(--pencil)]">
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
      aria-pressed={active}
      className={`font-mono text-[0.66rem] uppercase tracking-[0.1em] px-2 py-1 rounded-[2px] border outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)] transition-colors ${
        active
          ? "border-[color:var(--ink-blue)] bg-[color:var(--ink-blue)] text-[color:var(--primary-foreground)]"
          : "border-[color:var(--rule-strong)] bg-transparent text-[color:var(--ink)] hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)]"
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
  const reducedMotion = usePrefersReducedMotion();
  React.useEffect(() => {
    if (!active || reducedMotion) return;
    const id = window.setInterval(() => cbRef.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs, reducedMotion]);
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
 * Manuscript ink palette. Every slot resolves through a CSS variable so the
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
