"use client";

import { useEffect, useMemo, useState } from "react";

type Node = { id: number; x: number; y: number };
type Edge = [number, number];

const NODES: Node[] = [
  { id: 0, x: 80,  y: 60 },
  { id: 1, x: 220, y: 40 },
  { id: 2, x: 340, y: 110 },
  { id: 3, x: 150, y: 150 },
  { id: 4, x: 300, y: 210 },
  { id: 5, x: 60,  y: 240 },
  { id: 6, x: 200, y: 270 },
  { id: 7, x: 380, y: 280 },
];

const EDGES: Edge[] = [
  [0, 1], [0, 3], [1, 2], [1, 3],
  [2, 4], [3, 4], [3, 5], [3, 6],
  [4, 6], [4, 7], [5, 6], [6, 7],
];

const ADJ = (() => {
  const a: number[][] = Array.from({ length: NODES.length }, () => []);
  for (const [u, v] of EDGES) {
    a[u].push(v);
    a[v].push(u);
  }
  return a;
})();

type Frame = {
  visited: Set<number>;
  frontier: Set<number>;
  takenEdges: Set<string>;
  finishedAt: number; // ms since start
};

const edgeKey = (u: number, v: number) => (u < v ? `${u}-${v}` : `${v}-${u}`);

function bfsFrames(start: number): Frame[] {
  const visited = new Set<number>([start]);
  const takenEdges = new Set<string>();
  const frames: Frame[] = [];
  let queue: number[] = [start];
  frames.push({
    visited: new Set(visited),
    frontier: new Set(queue),
    takenEdges: new Set(takenEdges),
    finishedAt: 0,
  });
  let t = 0;
  while (queue.length) {
    const next: number[] = [];
    for (const u of queue) {
      for (const v of ADJ[u]) {
        if (!visited.has(v)) {
          visited.add(v);
          takenEdges.add(edgeKey(u, v));
          next.push(v);
        }
      }
    }
    t += 850;
    frames.push({
      visited: new Set(visited),
      frontier: new Set(next),
      takenEdges: new Set(takenEdges),
      finishedAt: t,
    });
    queue = next;
  }
  return frames;
}

const FRAMES = bfsFrames(0);
const TOTAL_MS = FRAMES[FRAMES.length - 1].finishedAt + 1800;

export function BFSHero() {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) % TOTAL_MS;
      setTick(elapsed);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const frame = useMemo(() => {
    let f = FRAMES[0];
    for (const candidate of FRAMES) {
      if (candidate.finishedAt <= tick) f = candidate;
    }
    return f;
  }, [tick]);

  return (
    <div className="relative w-full aspect-[4/3] max-w-md select-none">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 40%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <svg
        viewBox="0 0 440 320"
        className="w-full h-full"
        role="img"
        aria-label="A breadth-first search exploring a small graph"
      >
        <defs>
          <filter id="bfs-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* edges */}
        {EDGES.map(([u, v]) => {
          const taken = frame.takenEdges.has(edgeKey(u, v));
          const a = NODES[u];
          const b = NODES[v];
          return (
            <line
              key={`e-${u}-${v}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={taken ? "var(--primary)" : "currentColor"}
              strokeWidth={taken ? 1.8 : 1}
              strokeOpacity={taken ? 1 : 0.18}
              style={{ transition: "stroke var(--dur-base) var(--ease-spring), stroke-opacity var(--dur-base) var(--ease-spring), stroke-width var(--dur-base) var(--ease-spring)" }}
            />
          );
        })}

        {/* glow underlay on visited nodes */}
        {NODES.map((n) => {
          const visited = frame.visited.has(n.id);
          if (!visited) return null;
          return (
            <circle
              key={`g-${n.id}`}
              cx={n.x}
              cy={n.y}
              r="14"
              fill="var(--primary)"
              opacity="0.22"
              filter="url(#bfs-glow)"
            />
          );
        })}

        {/* nodes */}
        {NODES.map((n) => {
          const visited = frame.visited.has(n.id);
          const frontier = frame.frontier.has(n.id);
          return (
            <g key={`n-${n.id}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={frontier ? 8 : 6}
                fill={visited ? "var(--primary)" : "var(--background)"}
                stroke={visited ? "var(--primary)" : "currentColor"}
                strokeOpacity={visited ? 1 : 0.45}
                strokeWidth={frontier ? 2 : 1.4}
                style={{ transition: "fill var(--dur-base) var(--ease-out), stroke var(--dur-base) var(--ease-out), r var(--dur-base) var(--ease-spring)" }}
              />
              {frontier && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="12"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.2"
                  opacity="0.55"
                >
                  <animate attributeName="r" from="8" to="18" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.55" to="0" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* legend */}
        <g
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="currentColor"
          opacity="0.55"
          style={{ textTransform: "uppercase", letterSpacing: "0.06em" } as React.CSSProperties}
        >
          <circle cx="14" cy="306" r="3" fill="var(--primary)" />
          <text x="22" y="309">visited</text>
          <circle cx="84" cy="306" r="3" fill="none" stroke="var(--primary)" strokeWidth="1.4" />
          <text x="92" y="309">frontier</text>
        </g>
      </svg>
    </div>
  );
}
