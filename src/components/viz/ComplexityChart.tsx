"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * ComplexityChart: log-scale operations vs. input size, with selectable curves.
 * Defaults render the seven standard complexity classes. Users can toggle each
 * curve to compare side-by-side. Hovering reveals the operation count at that n.
 */
type CurveKey = "1" | "logn" | "n" | "nlogn" | "n2" | "n3" | "2n";
type Curve = {
  key: CurveKey;
  label: string;
  fn: (n: number) => number;
  color: string;
  dash?: string;
};

const ALL_CURVES: Curve[] = [
  { key: "1", label: "O(1)", fn: () => 1, color: PALETTE.c2, dash: "2 3" },
  { key: "logn", label: "O(log n)", fn: (n) => Math.log2(n), color: PALETTE.c1 },
  { key: "n", label: "O(n)", fn: (n) => n, color: PALETTE.c3 },
  { key: "nlogn", label: "O(n log n)", fn: (n) => n * Math.log2(n), color: PALETTE.c5 },
  { key: "n2", label: "O(n²)", fn: (n) => n * n, color: PALETTE.c4 },
  { key: "n3", label: "O(n³)", fn: (n) => n * n * n, color: PALETTE.c4, dash: "5 3" },
  { key: "2n", label: "O(2ⁿ)", fn: (n) => Math.pow(2, n), color: "var(--ink-red)", dash: "4 2" },
];

export function ComplexityChart({
  curves,
  maxN = 64,
  caption = "Growth of common complexity classes",
}: {
  curves?: CurveKey[];
  maxN?: number;
  caption?: string;
}) {
  const initial = new Set<CurveKey>(curves ?? ["1", "logn", "n", "nlogn", "n2", "2n"]);
  const [active, setActive] = React.useState<Set<CurveKey>>(initial);
  const [hover, setHover] = React.useState<number | null>(null);

  const W = 640;
  const H = 320;
  const PAD = { l: 56, r: 16, t: 16, b: 36 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  // log-y so 1 → 2ⁿ all fit. y in operation count.
  const minLog = 0;
  const maxLog = Math.log10(Math.max(...ALL_CURVES.filter((c) => active.has(c.key)).map((c) => c.fn(maxN))) || 1);

  // Round to 2 decimal places so the SVG `points` string is bit-identical
  // between the SSR pass (Node's libm) and the client (V8). Math.log2/log10
  // are not required to be cross-runtime stable, and the divergence shows up
  // as a hydration mismatch on log-scale curves like O(n log n) and O(2ⁿ).
  const q = (n: number) => Math.round(n * 100) / 100;
  const xOfN = (n: number) => q(PAD.l + ((n - 1) / (maxN - 1)) * plotW);
  const yOfOps = (ops: number) => {
    const v = Math.max(1, ops);
    const t = (Math.log10(v) - minLog) / (maxLog - minLog || 1);
    return q(PAD.t + (1 - t) * plotH);
  };

  const xTicks = [1, Math.floor(maxN / 4), Math.floor(maxN / 2), Math.floor((3 * maxN) / 4), maxN];
  const yTicks: number[] = [];
  for (let p = 0; p <= Math.ceil(maxLog); p++) yTicks.push(Math.pow(10, p));

  const hoverN = hover ?? Math.floor(maxN / 2);

  return (
    <VizFrame
      caption={caption}
      controls={
        <span className="text-foreground">
          n = <span className="tabular-nums font-semibold">{hoverN}</span>
        </span>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Operations versus input size, log scale"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const n = Math.round(((px - PAD.l) / plotW) * (maxN - 1) + 1);
          if (n >= 1 && n <= maxN) setHover(n);
        }}
      >
        {/* y grid */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yOfOps(v)}
              y2={yOfOps(v)}
              stroke={PALETTE.border}
              strokeDasharray="1 3"
            />
            <text
              x={PAD.l - 8}
              y={yOfOps(v) + 4}
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              textAnchor="end"
              fill={PALETTE.muted}
            >
              {fmtOps(v)}
            </text>
          </g>
        ))}
        {/* axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke={PALETTE.ink} strokeWidth="1" />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={PALETTE.ink} strokeWidth="1" />
        {xTicks.map((n) => (
          <g key={n}>
            <line x1={xOfN(n)} y1={H - PAD.b} x2={xOfN(n)} y2={H - PAD.b + 4} stroke={PALETTE.ink} />
            <text
              x={xOfN(n)}
              y={H - PAD.b + 16}
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              textAnchor="middle"
              fill={PALETTE.muted}
            >
              {n}
            </text>
          </g>
        ))}
        <text
          x={(PAD.l + W - PAD.r) / 2}
          y={H - 4}
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          textAnchor="middle"
          fill={PALETTE.muted}
        >
          input size n
        </text>
        <text
          x={-H / 2}
          y={14}
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          textAnchor="middle"
          transform="rotate(-90)"
          fill={PALETTE.muted}
        >
          operations (log scale)
        </text>

        {/* curves */}
        {ALL_CURVES.filter((c) => active.has(c.key)).map((c) => {
          const pts: string[] = [];
          for (let n = 1; n <= maxN; n++) {
            const ops = c.fn(n);
            if (!isFinite(ops)) continue;
            pts.push(`${xOfN(n)},${yOfOps(ops)}`);
          }
          return (
            <polyline
              key={c.key}
              fill="none"
              stroke={c.color}
              strokeWidth="1.75"
              strokeDasharray={c.dash}
              points={pts.join(" ")}
            />
          );
        })}

        {/* hover crosshair + readouts */}
        {hover != null && (
          <>
            <line
              x1={xOfN(hover)}
              x2={xOfN(hover)}
              y1={PAD.t}
              y2={H - PAD.b}
              stroke={PALETTE.ink}
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
            {ALL_CURVES.filter((c) => active.has(c.key)).map((c) => {
              const ops = c.fn(hover);
              if (!isFinite(ops)) return null;
              return (
                <circle
                  key={c.key}
                  cx={xOfN(hover)}
                  cy={yOfOps(Math.max(1, ops))}
                  r="3"
                  fill={c.color}
                  stroke={PALETTE.paper}
                />
              );
            })}
          </>
        )}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {ALL_CURVES.map((c) => {
          const on = active.has(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                const next = new Set(active);
                if (next.has(c.key)) next.delete(c.key);
                else next.add(c.key);
                setActive(next);
              }}
              aria-pressed={on}
              className="font-mono text-[0.65rem] uppercase tracking-[0.12em] px-2 py-1 border border-border bg-background flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
              style={{ opacity: on ? 1 : 0.3 }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 0,
                  borderTop: `2px ${c.dash ? "dashed" : "solid"} ${c.color}`,
                }}
              />
              {c.label}
              {hover != null ? (
                <span className="text-muted-foreground tabular-nums">
                  {fmtOps(c.fn(hover))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </VizFrame>
  );
}

function fmtOps(v: number): string {
  if (v < 1000) return v.toFixed(v < 10 ? 1 : 0);
  if (v < 1e6) return (v / 1e3).toFixed(1) + "K";
  if (v < 1e9) return (v / 1e6).toFixed(1) + "M";
  if (v < 1e12) return (v / 1e9).toFixed(1) + "B";
  if (v < 1e15) return (v / 1e12).toFixed(1) + "T";
  return v.toExponential(1);
}
