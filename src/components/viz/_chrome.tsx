"use client";

import * as React from "react";
import { Maximize2, X } from "lucide-react";

/**
 * The single chrome wrapping every visualization on the site. One designed
 * instrument — same surface, same header grammar, same controls — across
 * all sixteen viz components.
 *
 * Header layout is a three-part grid: [figure-number] [caption] [controls].
 * `figureNumber` is provided by `VizCounterContext` so authors don't number
 * anything by hand. `source` renders a small mono footer citation. The
 * expand control opens the viz in a full-viewport overlay.
 */
export function VizFrame({
  caption,
  children,
  controls,
  height,
  source,
  figureNumber: figureNumberProp,
}: {
  caption?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  height?: number | string;
  source?: string;
  /**
   * Override the auto-assigned figure number. Normally left unset so the
   * `VizCounterProvider` in `ArticleBody` assigns sequential numbers.
   */
  figureNumber?: number;
}) {
  const counterNumber = useVizCounterNumber();
  const figureNumber = figureNumberProp ?? counterNumber;
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const header = (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-3.5 pb-3 border-b border-border">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
        Fig {String(figureNumber).padStart(2, "0")}
      </span>
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.06em] text-foreground/75 truncate">
        {caption ?? "Figure"}
      </span>
      <span className="flex items-center gap-2 justify-self-end">
        {controls}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          title="Expand"
          aria-label="Expand visualization"
          className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          style={{ transitionDuration: "var(--dur-fast)", transitionTimingFunction: "var(--ease-out)" }}
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </span>
    </div>
  );

  const body = (
    <div
      className="px-5 py-5"
      style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
    >
      {children}
    </div>
  );

  const footer = source ? (
    <div className="px-5 py-2.5 border-t border-border bg-[color:var(--surface-1,var(--card))]">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted-foreground">
        {source}
      </span>
    </div>
  ) : null;

  return (
    <>
      <div className="surface-card overflow-hidden !p-0">
        {header}
        {body}
        {footer}
      </div>
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={caption ?? `Figure ${figureNumber}`}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{
            background: "color-mix(in srgb, var(--background) 92%, transparent)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
                Fig {String(figureNumber).padStart(2, "0")}
              </span>
              <span className="font-mono text-[0.75rem] uppercase tracking-[0.06em] text-foreground/85 truncate">
                {caption ?? "Figure"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close (esc)"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              style={{ transitionDuration: "var(--dur-fast)", transitionTimingFunction: "var(--ease-out)" }}
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em]">esc</span>
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-6 py-10">{body}</div>
          </div>
          {source && (
            <div className="px-6 py-3 border-t border-border">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted-foreground">
                {source}
              </span>
            </div>
          )}
        </div>
      )}
    </>
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
      className={`font-mono text-[0.7rem] uppercase tracking-[0.06em] px-2.5 py-1 rounded-md border transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-secondary text-foreground/75 hover:bg-accent hover:text-foreground"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      style={{ transitionDuration: "var(--dur-fast)", transitionTimingFunction: "var(--ease-out)" }}
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

/**
 * Inkwell shared palette. The c1..c5 slots delegate to --chart-1..--chart-5
 * so every visualization adapts automatically to light/dark mode. Authors
 * use these by name (c1 = first series, c2 = second, etc.) rather than
 * picking colors themselves — keeps the viz language coherent.
 */
export const PALETTE = {
  ink: "var(--foreground)",
  paper: "var(--background)",
  muted: "var(--muted-foreground)",
  border: "var(--border)",
  primary: "var(--primary)",
  destructive: "var(--destructive)",
  c1: "var(--chart-1)",
  c2: "var(--chart-2)",
  c3: "var(--chart-3)",
  c4: "var(--chart-4)",
  c5: "var(--chart-5)",
};

/* ------------------------------------------------------------------ */
/*  Figure auto-numbering                                              */
/* ------------------------------------------------------------------ */

type Counter = { next: () => number };

const VizCounterContext = React.createContext<Counter | null>(null);

/**
 * Wraps the article body so every `VizFrame` mounted inside receives a
 * sequential figure number without the markdown author touching anything.
 * Mounted by `ArticleBody`.
 */
export function VizCounterProvider({ children }: { children: React.ReactNode }) {
  // A mutable ref keeps the counter stable across React's render passes,
  // but we still need to reset it whenever the provider remounts (i.e.
  // on each article load). We accomplish that by initializing the ref
  // once per provider instance.
  const ref = React.useRef(0);
  const counter = React.useMemo<Counter>(
    () => ({
      next: () => {
        ref.current += 1;
        return ref.current;
      },
    }),
    [],
  );
  return <VizCounterContext.Provider value={counter}>{children}</VizCounterContext.Provider>;
}

/**
 * Returns the next figure number the first time a component mounts. If no
 * provider is present (e.g. a viz rendered outside an article), falls back
 * to 1 so the chrome still has something to display.
 */
function useVizCounterNumber(): number {
  const ctx = React.useContext(VizCounterContext);
  const [n] = React.useState<number>(() => (ctx ? ctx.next() : 1));
  return n;
}
