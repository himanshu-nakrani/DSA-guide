"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * TreeTraversal: rendered binary tree with selectable traversal order.
 * Each step highlights the currently visited node and emits to a sequence row.
 */
type Node = { v: number; l?: Node; r?: Node };
const DEFAULT_TREE: Node = {
  v: 8,
  l: { v: 3, l: { v: 1 }, r: { v: 6, l: { v: 4 }, r: { v: 7 } } },
  r: { v: 10, r: { v: 14, l: { v: 13 } } },
};

type Mode = "inorder" | "preorder" | "postorder" | "bfs";

export function TreeTraversal({
  tree = DEFAULT_TREE,
  mode: initialMode = "inorder",
  caption = "Binary tree traversal",
}: {
  tree?: Node;
  mode?: Mode;
  caption?: string;
}) {
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const order = React.useMemo(() => orderFor(tree, mode), [tree, mode]);
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [prevMode, setPrevMode] = React.useState<Mode>(initialMode);

  // Reset step/playing when mode changes — React 18+ "adjust state during render" pattern.
  if (prevMode !== mode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useTicker(playing, 600, () => {
    setStep((s) => {
      if (s >= order.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  });

  const visited = new Set(order.slice(0, step + 1));
  const current = order[step];

  // Layout: assign x by inorder index, y by depth
  const positions = React.useMemo(() => layout(tree), [tree]);
  const W = 640;
  const H = 280;
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.max(...ys);
  const xScale = (x: number) =>
    40 + ((x - xMin) / Math.max(1, xMax - xMin)) * (W - 80);
  const yScale = (y: number) => 40 + (y / Math.max(1, yMax)) * (H - 80);

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          {(["inorder", "preorder", "postorder", "bfs"] as Mode[]).map((m) => (
            <VizButton key={m} onClick={() => setMode(m)} active={mode === m}>
              {m}
            </VizButton>
          ))}
        </>
      }
    >
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* edges */}
          {positions.map((p, i) =>
            p.parent != null ? (
              <line
                key={`e-${i}`}
                x1={xScale(positions[p.parent].x)}
                y1={yScale(positions[p.parent].y) + 16}
                x2={xScale(p.x)}
                y2={yScale(p.y) - 16}
                stroke={PALETTE.ink}
                strokeWidth="1.25"
              />
            ) : null,
          )}
          {/* nodes */}
          {positions.map((p, i) => {
            const isCurrent = p.v === current;
            const wasVisited = visited.has(p.v);
            return (
              <g key={`n-${i}`}>
                <circle
                  cx={xScale(p.x)}
                  cy={yScale(p.y)}
                  r="18"
                  fill={isCurrent ? PALETTE.c3 : wasVisited ? PALETTE.c1 : PALETTE.paper}
                  stroke={PALETTE.ink}
                  strokeWidth="1.5"
                />
                <text
                  x={xScale(p.x)}
                  y={yScale(p.y) + 4}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="13"
                  fill={isCurrent || wasVisited ? PALETTE.paper : PALETTE.ink}
                >
                  {p.v}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex items-center gap-2">
          <VizButton onClick={() => setStep(0)} disabled={step === 0}>
            ⏮ reset
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            ←
          </VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton
            onClick={() => setStep((s) => Math.min(order.length - 1, s + 1))}
            disabled={step >= order.length - 1}
          >
            →
          </VizButton>
          <div className="ml-auto font-mono text-[0.72rem] text-muted-foreground">
            step {step + 1} / {order.length}
          </div>
        </div>

        <div className="border border-border p-3 font-mono text-sm tabular-nums tracking-wide">
          {order.map((v, i) => (
            <span
              key={i}
              style={{
                color: i <= step ? PALETTE.ink : PALETTE.muted,
                background: i === step ? "var(--ink-blue-wash)" : "transparent",
                padding: "0 4px",
              }}
            >
              {v}
              {i < order.length - 1 ? " · " : ""}
            </span>
          ))}
        </div>
      </div>
    </VizFrame>
  );
}

function orderFor(t: Node | undefined, mode: Mode): number[] {
  if (!t) return [];
  if (mode === "bfs") {
    const out: number[] = [];
    const q: Node[] = [t];
    while (q.length) {
      const n = q.shift()!;
      out.push(n.v);
      if (n.l) q.push(n.l);
      if (n.r) q.push(n.r);
    }
    return out;
  }
  const out: number[] = [];
  const walk = (n?: Node) => {
    if (!n) return;
    if (mode === "preorder") out.push(n.v);
    walk(n.l);
    if (mode === "inorder") out.push(n.v);
    walk(n.r);
    if (mode === "postorder") out.push(n.v);
  };
  walk(t);
  return out;
}

type Pos = { v: number; x: number; y: number; parent: number | null };

function layout(t: Node): Pos[] {
  const out: Pos[] = [];
  let counter = 0;
  const walk = (n: Node | undefined, depth: number, parentIdx: number | null) => {
    if (!n) return;
    const idx = out.length;
    out.push({ v: n.v, x: 0, y: depth, parent: parentIdx });
    walk(n.l, depth + 1, idx);
    out[idx].x = counter++;
    walk(n.r, depth + 1, idx);
  };
  walk(t, 0, null);
  return out;
}
