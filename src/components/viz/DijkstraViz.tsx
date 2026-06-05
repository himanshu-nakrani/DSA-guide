"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * DijkstraViz: shortest-path from a source, animated by node settlement order.
 * Companion table shows tentative distances per step.
 */
type Node = { id: number; label?: string; x: number; y: number };
type Edge = { u: number; v: number; w: number };

const DEFAULT_NODES: Node[] = [
  { id: 0, label: "A", x: 60, y: 70 },
  { id: 1, label: "B", x: 200, y: 40 },
  { id: 2, label: "C", x: 340, y: 80 },
  { id: 3, label: "D", x: 120, y: 200 },
  { id: 4, label: "E", x: 280, y: 200 },
  { id: 5, label: "F", x: 440, y: 200 },
];
const DEFAULT_EDGES: Edge[] = [
  { u: 0, v: 1, w: 4 },
  { u: 0, v: 3, w: 2 },
  { u: 1, v: 2, w: 5 },
  { u: 1, v: 4, w: 10 },
  { u: 2, v: 5, w: 3 },
  { u: 3, v: 4, w: 8 },
  { u: 4, v: 5, w: 2 },
  { u: 2, v: 4, w: 2 },
];

export function DijkstraViz({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  source = 0,
  caption = "Dijkstra — shortest paths from a single source",
}: {
  nodes?: Node[];
  edges?: Edge[];
  source?: number;
  caption?: string;
}) {
  const frames = React.useMemo(() => simulate(nodes, edges, source), [nodes, edges, source]);
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  useTicker(playing, 700, () => {
    setStep((s) => {
      if (s >= frames.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  });

  const f = frames[step];
  const W = 540;
  const H = 260;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)}>⏮</VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}>step</VizButton>
        </>
      }
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={caption}>
          {edges.map((e, i) => {
            const a = nodes[e.u];
            const b = nodes[e.v];
            const onPath = f.treeEdges.has(`${e.u}-${e.v}`) || f.treeEdges.has(`${e.v}-${e.u}`);
            const relaxing =
              f.relaxing &&
              ((f.relaxing.u === e.u && f.relaxing.v === e.v) ||
                (f.relaxing.u === e.v && f.relaxing.v === e.u));
            return (
              <g key={i}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={
                    relaxing
                      ? PALETTE.c3
                      : onPath
                        ? PALETTE.c1
                        : PALETTE.border
                  }
                  strokeWidth={relaxing || onPath ? 2.25 : 1.25}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 4}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10"
                  textAnchor="middle"
                  fill={PALETTE.muted}
                  style={{ paintOrder: "stroke", stroke: PALETTE.paper, strokeWidth: 3 }}
                >
                  {e.w}
                </text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const settled = f.settled.has(n.id);
            const current = f.current === n.id;
            const d = f.dist[n.id];
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="18"
                  fill={current ? PALETTE.c3 : settled ? PALETTE.c1 : PALETTE.paper}
                  stroke={PALETTE.ink}
                  strokeWidth="1.5"
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="13"
                  fill={current || settled ? PALETTE.paper : PALETTE.ink}
                >
                  {n.label ?? n.id}
                </text>
                <text
                  x={n.x}
                  y={n.y - 24}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="10"
                  fill={d === Infinity ? PALETTE.muted : PALETTE.ink}
                >
                  d = {d === Infinity ? "∞" : d}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="border border-border bg-background/60 p-3 min-w-44">
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground mb-2">
            tentative distances
          </div>
          <table className="font-mono text-[0.78rem] w-full">
            <tbody>
              {nodes.map((n) => (
                <tr key={n.id}>
                  <td className="pr-2 text-muted-foreground">{n.label ?? n.id}</td>
                  <td className="tabular-nums text-right">
                    {f.dist[n.id] === Infinity ? "∞" : f.dist[n.id]}
                  </td>
                  <td className="pl-2 text-muted-foreground">
                    {f.settled.has(n.id) ? "✓" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VizFrame>
  );
}

type Frame = {
  dist: number[];
  settled: Set<number>;
  current: number | null;
  treeEdges: Set<string>;
  relaxing: { u: number; v: number } | null;
};

function simulate(nodes: Node[], edges: Edge[], source: number): Frame[] {
  const N = nodes.length;
  const adj = new Map<number, { v: number; w: number }[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.u)!.push({ v: e.v, w: e.w });
    adj.get(e.v)!.push({ v: e.u, w: e.w });
  }
  const dist: number[] = Array(N).fill(Infinity);
  dist[source] = 0;
  const settled = new Set<number>();
  const treeEdges = new Set<string>();
  const frames: Frame[] = [];
  frames.push({
    dist: [...dist],
    settled: new Set(settled),
    current: null,
    treeEdges: new Set(treeEdges),
    relaxing: null,
  });

  while (settled.size < N) {
    let u = -1;
    let best = Infinity;
    for (let i = 0; i < N; i++) {
      if (!settled.has(i) && dist[i] < best) {
        best = dist[i];
        u = i;
      }
    }
    if (u === -1) break;
    settled.add(u);
    frames.push({
      dist: [...dist],
      settled: new Set(settled),
      current: u,
      treeEdges: new Set(treeEdges),
      relaxing: null,
    });
    for (const { v, w } of adj.get(u) ?? []) {
      if (settled.has(v)) continue;
      frames.push({
        dist: [...dist],
        settled: new Set(settled),
        current: u,
        treeEdges: new Set(treeEdges),
        relaxing: { u, v },
      });
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        // remove any prior parent edge for v
        for (const k of [...treeEdges]) {
          if (k.endsWith(`-${v}`)) treeEdges.delete(k);
        }
        treeEdges.add(`${u}-${v}`);
        dist[v] = nd;
        frames.push({
          dist: [...dist],
          settled: new Set(settled),
          current: u,
          treeEdges: new Set(treeEdges),
          relaxing: { u, v },
        });
      }
    }
  }
  frames.push({
    dist: [...dist],
    settled: new Set(settled),
    current: null,
    treeEdges: new Set(treeEdges),
    relaxing: null,
  });
  return frames;
}
