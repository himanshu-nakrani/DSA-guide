"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * RecursionTree: renders a call tree for a recurrence. Defaults to fib(n).
 * Useful for illustrating exponential blow-up and memoization savings.
 */
export function RecursionTree({
  n = 5,
  memoized = false,
  caption,
}: {
  n?: number;
  memoized?: boolean;
  caption?: string;
}) {
  const tree = React.useMemo(() => buildFib(n, memoized), [n, memoized]);

  const W = 720;
  const H = 320;
  const PAD = 24;
  const nodesByDepth: Map<number, Node[]> = new Map();
  for (const node of tree.nodes) {
    if (!nodesByDepth.has(node.depth)) nodesByDepth.set(node.depth, []);
    nodesByDepth.get(node.depth)!.push(node);
  }
  const maxDepth = Math.max(...tree.nodes.map((n) => n.depth));
  // Assign x positions by inorder index per depth
  const xByDepth: Map<number, number[]> = new Map();
  for (let d = 0; d <= maxDepth; d++) {
    const layer = nodesByDepth.get(d) ?? [];
    const slots = layer.length;
    xByDepth.set(
      d,
      layer.map((_, i) => PAD + ((i + 0.5) / slots) * (W - 2 * PAD)),
    );
    layer.forEach((node, i) => {
      node.x = xByDepth.get(d)![i];
      node.y = PAD + (d / Math.max(1, maxDepth)) * (H - 2 * PAD);
    });
  }

  // total ops
  const totalCalls = tree.nodes.length;

  const figureLabel =
    caption ??
    `fib(${n}) call tree — ${memoized ? "memoized" : "naive"} (${totalCalls} call${
      totalCalls === 1 ? "" : "s"
    })`;

  return (
    <VizFrame caption={figureLabel}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={figureLabel}>
        {tree.edges.map((e, i) => {
          const a = tree.nodes[e[0]];
          const b = tree.nodes[e[1]];
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={PALETTE.ink}
              strokeOpacity={0.4}
            />
          );
        })}
        {tree.nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r="16"
              fill={n.cached ? PALETTE.muted : n.isBase ? PALETTE.c3 : PALETTE.c1}
              fillOpacity={n.cached ? 0.45 : 1}
              stroke={PALETTE.ink}
              strokeWidth="1.25"
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="10"
              fill={n.cached ? PALETTE.ink : PALETTE.paper}
            >
              f({n.k})
            </text>
          </g>
        ))}
        <g transform={`translate(${W - 160}, ${H - 36})`}>
          <Swatch color={PALETTE.c1} label="recursive" y={0} />
          <Swatch color={PALETTE.c3} label="base case" y={14} />
          <Swatch color={PALETTE.muted} label="cache hit" y={28} dim />
        </g>
      </svg>
    </VizFrame>
  );
}

function Swatch({
  color,
  label,
  y,
  dim,
}: {
  color: string;
  label: string;
  y: number;
  dim?: boolean;
}) {
  return (
    <g transform={`translate(0, ${y})`}>
      <circle cx={6} cy={0} r="5" fill={color} fillOpacity={dim ? 0.45 : 1} stroke={PALETTE.ink} />
      <text x={16} y={3} fontFamily="ui-monospace, monospace" fontSize="9" fill={PALETTE.muted}>
        {label}
      </text>
    </g>
  );
}

type Node = { id: number; k: number; depth: number; x: number; y: number; cached: boolean; isBase: boolean };

function buildFib(n: number, memoized: boolean): { nodes: Node[]; edges: [number, number][] } {
  const nodes: Node[] = [];
  const edges: [number, number][] = [];
  const seen = new Set<number>();
  const walk = (k: number, depth: number): number => {
    const id = nodes.length;
    const cached = memoized && seen.has(k);
    const isBase = k <= 1;
    nodes.push({ id, k, depth, x: 0, y: 0, cached, isBase });
    seen.add(k);
    if (isBase || cached) return id;
    const l = walk(k - 1, depth + 1);
    const r = walk(k - 2, depth + 1);
    edges.push([id, l]);
    edges.push([id, r]);
    return id;
  };
  walk(n, 0);
  return { nodes, edges };
}
