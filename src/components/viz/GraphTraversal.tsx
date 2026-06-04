"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * GraphTraversal: small undirected graph; BFS or DFS animation with a
 * companion frontier/stack display.
 */
type Edge = [number, number];
type Graph = {
  nodes: { id: number; label?: string; x: number; y: number }[];
  edges: Edge[];
};

const DEFAULT_GRAPH: Graph = {
  nodes: [
    { id: 0, x: 80, y: 60 },
    { id: 1, x: 220, y: 40 },
    { id: 2, x: 360, y: 80 },
    { id: 3, x: 120, y: 180 },
    { id: 4, x: 280, y: 200 },
    { id: 5, x: 420, y: 200 },
    { id: 6, x: 540, y: 120 },
  ],
  edges: [
    [0, 1],
    [0, 3],
    [1, 2],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5],
    [5, 6],
    [2, 6],
  ],
};

type Mode = "bfs" | "dfs";

export function GraphTraversal({
  graph = DEFAULT_GRAPH,
  start = 0,
  mode: initialMode = "bfs",
  caption = "Graph traversal — BFS vs. DFS from a source",
}: {
  graph?: Graph;
  start?: number;
  mode?: Mode;
  caption?: string;
}) {
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const frames = React.useMemo(() => computeFrames(graph, start, mode), [graph, start, mode]);
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [prevMode, setPrevMode] = React.useState<Mode>(initialMode);

  if (prevMode !== mode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

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
  const W = 620;
  const H = 260;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setMode("bfs")} active={mode === "bfs"}>
            bfs
          </VizButton>
          <VizButton onClick={() => setMode("dfs")} active={mode === "dfs"}>
            dfs
          </VizButton>
          <VizButton onClick={() => setStep(0)}>⏮</VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}>
            step
          </VizButton>
        </>
      }
    >
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {graph.edges.map(([a, b], i) => {
            const A = graph.nodes[a];
            const B = graph.nodes[b];
            const traversed = f.treeEdges.some(
              ([x, y]) => (x === a && y === b) || (x === b && y === a),
            );
            return (
              <line
                key={i}
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={traversed ? PALETTE.c1 : PALETTE.border}
                strokeWidth={traversed ? 2 : 1.25}
              />
            );
          })}
          {graph.nodes.map((n) => {
            const visited = f.visited.has(n.id);
            const inFrontier = f.frontier.includes(n.id);
            const isCurrent = f.current === n.id;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="18"
                  fill={
                    isCurrent
                      ? PALETTE.c3
                      : visited
                        ? PALETTE.c1
                        : inFrontier
                          ? "color-mix(in srgb, var(--pencil) 22%, transparent)"
                          : PALETTE.paper
                  }
                  stroke={PALETTE.ink}
                  strokeWidth="1.5"
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="13"
                  fill={isCurrent || visited ? PALETTE.paper : PALETTE.ink}
                >
                  {n.label ?? n.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-2 gap-3">
          <Section
            label={mode === "bfs" ? "queue (FIFO)" : "stack (LIFO)"}
            items={f.frontier.map(String)}
            color={PALETTE.c1}
          />
          <Section label="visited order" items={f.order.map(String)} color={PALETTE.c3} />
        </div>
      </div>
    </VizFrame>
  );
}

function Section({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div className="border border-border bg-background/60 p-3">
      <div className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-7">
        {items.length === 0 && (
          <span className="font-mono text-xs italic text-muted-foreground">empty</span>
        )}
        {items.map((v, i) => (
          <div
            key={i}
            className="font-mono text-xs px-2 py-1 border"
            style={{ borderColor: color, color }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

type Frame = {
  current: number | null;
  visited: Set<number>;
  frontier: number[];
  order: number[];
  treeEdges: Edge[];
};

function computeFrames(g: Graph, start: number, mode: Mode): Frame[] {
  const adj = new Map<number, number[]>();
  for (const n of g.nodes) adj.set(n.id, []);
  for (const [a, b] of g.edges) {
    adj.get(a)!.push(b);
    adj.get(b)!.push(a);
  }

  const frames: Frame[] = [];
  const visited = new Set<number>();
  const frontier: number[] = [start];
  const order: number[] = [];
  const treeEdges: Edge[] = [];
  frames.push({
    current: null,
    visited: new Set(visited),
    frontier: [...frontier],
    order: [...order],
    treeEdges: [...treeEdges],
  });

  while (frontier.length) {
    const u = mode === "bfs" ? frontier.shift()! : frontier.pop()!;
    if (visited.has(u)) {
      frames.push({
        current: null,
        visited: new Set(visited),
        frontier: [...frontier],
        order: [...order],
        treeEdges: [...treeEdges],
      });
      continue;
    }
    visited.add(u);
    order.push(u);
    const neighbors = (adj.get(u) ?? []).slice().sort((a, b) => a - b);
    for (const v of neighbors) {
      if (!visited.has(v) && !frontier.includes(v)) {
        frontier.push(v);
        treeEdges.push([u, v]);
      }
    }
    frames.push({
      current: u,
      visited: new Set(visited),
      frontier: [...frontier],
      order: [...order],
      treeEdges: [...treeEdges],
    });
  }
  return frames;
}
