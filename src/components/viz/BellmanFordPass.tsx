"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type Variant = "negative-edge" | "negative-cycle";
type NodeId = "A" | "B" | "C" | "D";
export type BellmanFordEdge = { from: NodeId; to: NodeId; weight: number };
type Edge = BellmanFordEdge;
type Status = "ready" | "relaxing" | "pass-complete" | "complete" | "negative-cycle";
type Frame = {
  pass: number;
  edgeIndex: number | null;
  dist: Record<NodeId, number>;
  edge: Edge | null;
  updated: boolean;
  changedThisPass: boolean;
  status: Status;
  title: string;
  explanation: string;
};

const NODES: { id: NodeId; x: number; y: number }[] = [
  { id: "A", x: 55, y: 124 },
  { id: "B", x: 180, y: 45 },
  { id: "C", x: 305, y: 124 },
  { id: "D", x: 430, y: 45 },
];

const VARIANTS: Record<Variant, Edge[]> = {
  "negative-edge": [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "C", weight: -3 },
    { from: "C", to: "D", weight: 4 },
    { from: "B", to: "D", weight: 7 },
  ],
  "negative-cycle": [
    { from: "A", to: "B", weight: 4 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "C", weight: -3 },
    { from: "C", to: "D", weight: 4 },
    { from: "D", to: "B", weight: -6 },
  ],
};

export function BellmanFordPass({
  variant: initialVariant = "negative-edge",
  caption = "Bellman–Ford: relax every edge, pass by pass",
}: {
  variant?: Variant;
  caption?: string;
}) {
  const variant: Variant = initialVariant === "negative-cycle" ? "negative-cycle" : "negative-edge";
  const edges = VARIANTS[variant];
  const frames = React.useMemo(() => simulateBellmanFord(edges), [edges]);
  const [step, setStep] = React.useState(0);
  const [previousVariant, setPreviousVariant] = React.useState(variant);

  if (previousVariant !== variant) {
    setPreviousVariant(variant);
    setStep(0);
  }

  const frame = frames[step];
  const nextStep = () => setStep((current) => Math.min(frames.length - 1, current + 1));
  const previousStep = () => setStep((current) => Math.max(0, current - 1));
  const nextPass = () => {
    const targetPass = frame.pass + 1;
    const index = frames.findIndex((candidate, index) => index > step && candidate.pass === targetPass && candidate.edgeIndex === null);
    setStep(index >= 0 ? index : frames.length - 1);
  };
  const statusColor = frame.status === "negative-cycle" ? PALETTE.destructive : frame.status === "complete" ? PALETTE.c1 : PALETTE.c3;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <span role="group" aria-label="Bellman-Ford graph variant" className="flex items-center gap-2">
            <VizButton active={variant === "negative-edge"} onClick={() => { setPreviousVariant("negative-edge"); setStep(0); }}>negative edge</VizButton>
            <VizButton active={variant === "negative-cycle"} onClick={() => { setPreviousVariant("negative-cycle"); setStep(0); }}>negative cycle</VizButton>
          </span>
          <VizButton onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
          <VizButton onClick={previousStep} disabled={step === 0}>← prev</VizButton>
          <VizButton onClick={nextStep} disabled={step === frames.length - 1}>next edge</VizButton>
          <VizButton onClick={nextPass} disabled={step === frames.length - 1}>next pass</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="Bellman-Ford pass explorer">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Pass invariant</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">After pass k, every shortest path using at most k edges has had a chance to propagate.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="space-y-3">
          <svg viewBox="0 0 490 190" className="w-full h-auto" role="img" aria-label="Weighted directed graph with current Bellman-Ford relaxation">
            <defs>
              <marker id="bellman-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L7,3.5 L0,7 z" fill={PALETTE.border} />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const from = NODES.find((node) => node.id === edge.from)!;
              const to = NODES.find((node) => node.id === edge.to)!;
              const active = frame.edgeIndex === index;
              return (
                <g key={`${edge.from}-${edge.to}-${index}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? PALETTE.c3 : PALETTE.border} strokeWidth={active ? 2.6 : 1.5} markerEnd="url(#bellman-arrow)" />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill={active ? PALETTE.ink : PALETTE.muted} style={{ paintOrder: "stroke", stroke: PALETTE.paper, strokeWidth: 4 }}>{edge.weight}</text>
                </g>
              );
            })}
            {NODES.map((node) => {
              const value = frame.dist[node.id];
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="22" fill={frame.edge?.from === node.id ? PALETTE.c3 : PALETTE.paper} stroke={PALETTE.ink} strokeWidth="1.6" />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={frame.edge?.from === node.id ? PALETTE.paper : PALETTE.ink}>{node.id}</text>
                  <text x={node.x} y={node.y + 39} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill={value === Infinity ? PALETTE.muted : PALETTE.ink}>d = {formatDistance(value)}</text>
                </g>
              );
            })}
          </svg>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
              <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">distance table</div>
              <div className="grid grid-cols-4 gap-2 font-mono text-sm tabular-nums">
                {NODES.map((node) => <div key={node.id} className="border px-2 py-2 text-center" style={{ borderColor: PALETTE.border }}><div className="text-[0.65rem] text-[color:var(--pencil)]">{node.id}</div><div>{formatDistance(frame.dist[node.id])}</div></div>)}
              </div>
            </div>
            <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-1)" }}>
              <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">current edge</div>
              <p className="m-0 font-mono text-sm leading-relaxed text-[color:var(--ink)]">{frame.edge ? `${frame.edge.from} → ${frame.edge.to} (weight ${frame.edge.weight})` : "pass boundary"}</p>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">{frame.edge ? `${formatDistance(frame.dist[frame.edge.from])} + ${frame.edge.weight} ${frame.updated ? "improves" : "does not improve"} d[${frame.edge.to}].` : `Pass ${frame.pass} changed a distance: ${frame.changedThisPass ? "continue unless this was the final detection pass." : "early exit is safe."}`}</p>
            </div>
          </div>

          <div className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: statusColor }} aria-live="polite">
            <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: statusColor }}>{frame.status}</span>
            <span className="text-[color:var(--ink-soft)]">{frame.title} {frame.explanation}</span>
          </div>
        </div>
      </section>
    </VizFrame>
  );
}

export function simulateBellmanFord(edges: Edge[]): Frame[] {
  const dist: Record<NodeId, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity };
  const frames: Frame[] = [{ pass: 0, edgeIndex: null, dist: { ...dist }, edge: null, updated: false, changedThisPass: false, status: "ready", title: "Initialize", explanation: "The source A starts at distance 0; all other vertices begin unreachable." }];
  let pass = 1;
  let changed = false;
  const maxPasses = 3;

  while (pass <= maxPasses) {
    changed = false;
    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
      const edge = edges[edgeIndex];
      const candidate = dist[edge.from] === Infinity ? Infinity : dist[edge.from] + edge.weight;
      const updated = candidate < dist[edge.to];
      if (updated) {
        dist[edge.to] = candidate;
        changed = true;
      }
      frames.push({ pass, edgeIndex, dist: { ...dist }, edge, updated, changedThisPass: changed, status: "relaxing", title: updated ? "Relax the edge" : "Keep the current distance", explanation: updated ? `The candidate distance is smaller, so d[${edge.to}] becomes ${candidate}.` : "No shorter path is found through this edge, so the current value stays safe for now." });
    }
    frames.push({ pass, edgeIndex: null, dist: { ...dist }, edge: null, updated: false, changedThisPass: changed, status: "pass-complete", title: `Finish pass ${pass}`, explanation: changed ? "At least one value changed; another pass may propagate the improvement farther." : "No value changed during a complete pass, so early exit is safe." });
    if (!changed) {
      frames.push({ pass, edgeIndex: null, dist: { ...dist }, edge: null, updated: false, changedThisPass: false, status: "complete", title: "Shortest paths stabilized", explanation: "Every edge was checked without improvement. This variant has no reachable negative cycle." });
      return frames;
    }
    pass += 1;
  }

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    const candidate = dist[edge.from] === Infinity ? Infinity : dist[edge.from] + edge.weight;
    const updated = candidate < dist[edge.to];
    frames.push({ pass: maxPasses + 1, edgeIndex, dist: { ...dist }, edge, updated, changedThisPass: true, status: updated ? "negative-cycle" : "relaxing", title: updated ? "Negative cycle detected" : "Detection pass", explanation: updated ? `An improvement remains after V − 1 passes. A reachable negative cycle makes a finite shortest-path answer undefined.` : "This edge does not prove a cycle; continue the detection pass." });
    if (updated) return frames;
  }
  frames.push({ pass: maxPasses + 1, edgeIndex: null, dist: { ...dist }, edge: null, updated: false, changedThisPass: false, status: "complete", title: "No negative cycle detected", explanation: "The extra pass found no further relaxation." });
  return frames;
}

function formatDistance(value: number): string {
  return value === Infinity ? "∞" : String(value);
}
