"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type ZeroOneVariant = "valid" | "invalid-weight";
export type ZeroOneNode = "A" | "B" | "C" | "D" | "E";
export type ZeroOneEdge = { from: ZeroOneNode; to: ZeroOneNode; weight: number };
export type ZeroOneAction = "front" | "back" | "keep" | "invalid";
export type ZeroOneQueueEntry = { id: ZeroOneNode; distance: number };
export type ZeroOneFrame = {
  step: number;
  stage: "ready" | "pop" | "edge" | "complete" | "invalid";
  status: "ready" | "processing" | "complete" | "invalid";
  currentNode: ZeroOneNode | null;
  edgeIndex: number | null;
  edge: ZeroOneEdge | null;
  dist: Record<ZeroOneNode, number>;
  deque: ZeroOneQueueEntry[];
  candidate: number | null;
  improved: boolean;
  correctAction: ZeroOneAction | null;
  nextDeque: ZeroOneQueueEntry[];
  nextDist: Record<ZeroOneNode, number>;
  title: string;
  explanation: string;
};

type Choice = { id: ZeroOneAction; label: string };

const NODES: Array<{ id: ZeroOneNode; x: number; y: number }> = [
  { id: "A", x: 58, y: 120 },
  { id: "B", x: 188, y: 48 },
  { id: "C", x: 188, y: 192 },
  { id: "D", x: 358, y: 48 },
  { id: "E", x: 358, y: 192 },
];

const GRAPH: Record<ZeroOneVariant, ZeroOneEdge[]> = {
  valid: [
    { from: "A", to: "B", weight: 1 },
    { from: "A", to: "C", weight: 0 },
    { from: "C", to: "D", weight: 1 },
    { from: "C", to: "E", weight: 0 },
    { from: "B", to: "D", weight: 0 },
    { from: "D", to: "E", weight: 1 },
  ],
  "invalid-weight": [
    { from: "A", to: "B", weight: 1 },
    { from: "A", to: "C", weight: 0 },
    { from: "A", to: "E", weight: 2 },
    { from: "C", to: "D", weight: 1 },
    { from: "C", to: "E", weight: 0 },
    { from: "B", to: "D", weight: 0 },
    { from: "D", to: "E", weight: 1 },
  ],
};

const INITIAL_DIST: Record<ZeroOneNode, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };

export function ZeroOneDeque({
  variant: initialVariant = "valid",
  caption = "0–1 BFS: predict front or back insertion in the deque",
}: {
  variant?: ZeroOneVariant;
  caption?: string;
}) {
  const safeInitialVariant: ZeroOneVariant = initialVariant === "invalid-weight" ? "invalid-weight" : "valid";
  const [variant, setVariant] = React.useState<ZeroOneVariant>(safeInitialVariant);
  const edges = GRAPH[variant];
  const frames = React.useMemo(() => buildZeroOneDequeFrames(edges), [edges]);
  const [step, setStep] = React.useState(0);
  const [choice, setChoice] = React.useState<ZeroOneAction | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const [previousInitialVariant, setPreviousInitialVariant] = React.useState(safeInitialVariant);

  if (previousInitialVariant !== safeInitialVariant) {
    setPreviousInitialVariant(safeInitialVariant);
    setVariant(safeInitialVariant);
    setStep(0);
    setChoice(null);
    setRevealed(false);
  }

  const frame = frames[step];
  const complete = frame.stage === "complete" || frame.stage === "invalid";
  const edgeChoices: Choice[] = [
    { id: "front", label: "push front" },
    { id: "back", label: "push back" },
    { id: "keep", label: "keep deque" },
    { id: "invalid", label: "reject weight" },
  ];
  const selectedChoice = edgeChoices.find((candidate) => candidate.id === choice);
  const isCorrect = revealed && choice === frame.correctAction;
  const nextDisabled = frame.stage === "edge" && !revealed;

  const reset = () => {
    setStep(0);
    setChoice(null);
    setRevealed(false);
  };
  const goTo = (nextStep: number) => {
    setStep(Math.max(0, Math.min(frames.length - 1, nextStep)));
    setChoice(null);
    setRevealed(false);
  };

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <span role="group" aria-label="0–1 BFS graph variant" className="flex items-center gap-2">
            <VizButton active={variant === "valid"} onClick={() => { setVariant("valid"); reset(); }}>valid weights</VizButton>
            <VizButton active={variant === "invalid-weight"} onClick={() => { setVariant("invalid-weight"); reset(); }}>weight 2 challenge</VizButton>
          </span>
          <VizButton onClick={reset} disabled={step === 0}>reset</VizButton>
          <VizButton onClick={() => goTo(step - 1)} disabled={step === 0}>← prev</VizButton>
          <VizButton onClick={() => goTo(step + 1)} disabled={complete || nextDisabled}>next edge</VizButton>
          <VizButton onClick={() => goTo(frames.length - 1)} disabled={complete || nextDisabled}>finish</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="0–1 BFS deque explorer">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Deque invariant</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">A weight-0 improvement goes to the front; a weight-1 improvement goes to the back, keeping distances ordered.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] items-start">
          <svg viewBox="0 0 416 250" className="w-full h-auto" role="img" aria-label="Weighted graph for 0–1 BFS with the current edge highlighted">
            <defs>
              <marker id="zero-one-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L7,3.5 L0,7 z" fill={PALETTE.border} />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const from = NODES.find((node) => node.id === edge.from)!;
              const to = NODES.find((node) => node.id === edge.to)!;
              const active = frame.edgeIndex === index;
              return (
                <g key={`${edge.from}-${edge.to}-${index}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={active ? (edge.weight === 2 ? PALETTE.destructive : PALETTE.c3) : PALETTE.border} strokeWidth={active ? 3 : 1.5} markerEnd="url(#zero-one-arrow)" />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill={active ? (edge.weight === 2 ? PALETTE.destructive : PALETTE.ink) : PALETTE.muted} style={{ paintOrder: "stroke", stroke: PALETTE.paper, strokeWidth: 4 }}>{edge.weight}</text>
                </g>
              );
            })}
            {NODES.map((node) => {
              const active = frame.currentNode === node.id;
              const queued = frame.deque.some((entry) => entry.id === node.id);
              const value = frame.dist[node.id];
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="23" fill={active ? PALETTE.c3 : queued ? "color-mix(in srgb, var(--ink-blue) 12%, transparent)" : PALETTE.paper} stroke={active ? PALETTE.ink : PALETTE.border} strokeWidth={active ? 2.5 : 1.5} />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={active ? PALETTE.paper : PALETTE.ink}>{node.id}</text>
                  <text x={node.x} y={node.y + 40} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill={value === Infinity ? PALETTE.muted : PALETTE.ink}>d = {formatDistance(value)}</text>
                  <text x={node.x} y={node.y - 32} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={active ? PALETTE.ink : PALETTE.muted}>{active ? "current" : queued ? "queued" : ""}</text>
                </g>
              );
            })}
          </svg>

          <div className="space-y-3">
            <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Deque · front → back</div>
                <span className="font-mono text-xs" style={{ color: frame.status === "invalid" ? PALETTE.destructive : PALETTE.ink }}>{frame.status}</span>
              </div>
              <div className="flex min-h-14 flex-wrap items-center gap-2" aria-label="Deque contents">
                {frame.deque.length === 0 ? <span className="font-mono text-sm text-[color:var(--pencil)]">empty</span> : frame.deque.map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className="border px-2 py-2 text-center font-mono text-sm" style={{ borderColor: index === 0 ? PALETTE.c3 : PALETTE.border, background: index === 0 ? "color-mix(in srgb, var(--ink-ochre) 13%, transparent)" : "var(--surface-1)" }}>
                    <div>{entry.id}</div>
                    <div className="text-[0.65rem] text-[color:var(--pencil)]">d={formatDistance(entry.distance)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 font-mono text-sm tabular-nums" aria-label="Distance table">
              {NODES.map((node) => <div key={node.id} className="border px-1 py-2 text-center" style={{ borderColor: PALETTE.border }}><div className="text-[0.65rem] text-[color:var(--pencil)]">{node.id}</div><div>{formatDistance(frame.dist[node.id])}</div></div>)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] items-start">
          <div className="border p-3" style={{ borderColor: frame.edge?.weight === 2 ? PALETTE.destructive : PALETTE.border, background: "var(--surface-1)" }}>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Current decision</div>
            {frame.stage === "ready" ? <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">The source A is ready at distance 0. Pop the front, then inspect each outgoing edge.</p> : frame.stage === "pop" ? <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">Pop <strong>{frame.currentNode}</strong> from the front. Its distance is already the smallest distance represented in the deque.</p> : frame.stage === "complete" ? <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">The deque is empty. Every reachable vertex has been processed in non-decreasing distance order.</p> : frame.stage === "invalid" ? <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">Weight 2 breaks the 0–1 BFS contract. Reject this edge and choose Dijkstra or another algorithm that supports the actual weights.</p> : (
              <>
                <div className="font-mono text-sm text-[color:var(--ink)]">{frame.edge?.from} → {frame.edge?.to} · weight {frame.edge?.weight}</div>
                <p className="mt-2 mb-0 font-mono text-sm tabular-nums text-[color:var(--ink-soft)]">{formatDistance(frame.dist[frame.edge!.from])} + {frame.edge!.weight} = {formatDistance(frame.candidate ?? Infinity)} {frame.improved ? "<" : "≥"} {formatDistance(frame.dist[frame.edge!.to])}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">{frame.improved ? "This candidate improves the neighbor. Predict which end of the deque receives it." : "This candidate does not improve the neighbor, so the deque should not change."}</p>
              </>
            )}
          </div>

          {frame.stage === "edge" ? (
            <div className="space-y-3" aria-label="Deque insertion prediction">
              <div className="grid gap-2">
                {edgeChoices.map((candidate) => {
                  const selected = choice === candidate.id;
                  const correct = revealed && candidate.id === frame.correctAction;
                  const incorrect = revealed && selected && candidate.id !== frame.correctAction;
                  const borderColor = correct ? PALETTE.c1 : incorrect ? PALETTE.destructive : selected ? PALETTE.c3 : PALETTE.border;
                  return <button key={candidate.id} type="button" onClick={() => { setChoice(candidate.id); setRevealed(false); }} className="flex w-full items-center justify-between border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]" style={{ borderColor, background: selected ? "color-mix(in srgb, var(--ink-ochre) 12%, transparent)" : "var(--surface-1)" }}><span>{candidate.label}</span><span className="font-mono text-xs" style={{ color: correct ? PALETTE.c1 : incorrect ? PALETTE.destructive : PALETTE.muted }}>{candidate.id === "front" ? "0" : candidate.id === "back" ? "1" : candidate.id === "invalid" ? "!" : "—"}</span></button>;
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <VizButton onClick={() => setRevealed(true)} disabled={choice === null} active={revealed}>check choice</VizButton>
                <span className="font-mono text-[0.7rem] leading-relaxed text-[color:var(--pencil)]" aria-live="polite">{!revealed ? "Predict the insertion side before continuing." : isCorrect ? `Correct. ${selectedChoice?.label} preserves the deque invariant.` : `Not quite. ${frame.correctAction === "invalid" ? "Weight 2 is outside the 0–1 BFS contract." : `A weight-${frame.edge?.weight} improvement belongs at the ${frame.correctAction}.`}`}</span>
              </div>
            </div>
          ) : <div className="border p-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.status === "invalid" ? PALETTE.destructive : PALETTE.border }} aria-live="polite"><span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.status === "invalid" ? PALETTE.destructive : PALETTE.c1 }}>{frame.status === "invalid" ? "Boundary" : "Next"}</span>{frame.stage === "pop" ? "Advance to inspect this vertex’s outgoing edges." : frame.stage === "complete" ? "The non-decreasing-distance invariant survived every valid edge." : "Advance to begin the first pop."}</div>}
        </div>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.status === "invalid" ? PALETTE.destructive : frame.stage === "complete" ? PALETTE.c1 : PALETTE.c3 }} aria-live="polite">
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.status === "invalid" ? PALETTE.destructive : frame.stage === "complete" ? PALETTE.c1 : PALETTE.c3 }}>{frame.title}</span>
          {frame.explanation}
        </div>
      </section>
    </VizFrame>
  );
}

export function buildZeroOneDequeFrames(edges: ZeroOneEdge[]): ZeroOneFrame[] {
  const dist: Record<ZeroOneNode, number> = { ...INITIAL_DIST };
  let deque: ZeroOneQueueEntry[] = [{ id: "A", distance: 0 }];
  const frames: ZeroOneFrame[] = [{ step: 0, stage: "ready", status: "ready", currentNode: null, edgeIndex: null, edge: null, dist: { ...dist }, deque: [...deque], candidate: null, improved: false, correctAction: null, nextDeque: [...deque], nextDist: { ...dist }, title: "Initialize", explanation: "The source A starts at distance 0. The deque is ordered from front to back." }];
  let step = 1;
  const adjacency = new Map<ZeroOneNode, Array<{ edge: ZeroOneEdge; index: number }>>();
  for (const node of ["A", "B", "C", "D", "E"] as ZeroOneNode[]) adjacency.set(node, []);
  edges.forEach((edge, index) => adjacency.get(edge.from)?.push({ edge, index }));

  while (deque.length > 0) {
    const popped = deque[0];
    deque = deque.slice(1);
    frames.push({ step: step++, stage: "pop", status: "processing", currentNode: popped.id, edgeIndex: null, edge: null, dist: { ...dist }, deque: [...deque], candidate: null, improved: false, correctAction: null, nextDeque: [...deque], nextDist: { ...dist }, title: `Pop ${popped.id} from the front`, explanation: `The deque removes ${popped.id} at distance ${popped.distance}. Any newly improved weight-0 neighbor goes ahead of weight-1 work.` });

    for (const { edge, index } of adjacency.get(popped.id) ?? []) {
      const candidate = dist[edge.from] + edge.weight;
      if (edge.weight !== 0 && edge.weight !== 1) {
        frames.push({ step: step++, stage: "invalid", status: "invalid", currentNode: popped.id, edgeIndex: index, edge, dist: { ...dist }, deque: [...deque], candidate, improved: false, correctAction: "invalid", nextDeque: [...deque], nextDist: { ...dist }, title: "Reject the edge weight", explanation: `A weight-${edge.weight} edge violates the 0–1 BFS assumption. The front/back proof no longer applies, so stop rather than silently corrupting the distances.` });
        return frames;
      }
      const improved = candidate < dist[edge.to];
      const nextDist = { ...dist };
      let nextDeque = [...deque];
      let correctAction: ZeroOneAction = "keep";
      if (improved) {
        nextDist[edge.to] = candidate;
        const entry = { id: edge.to, distance: candidate };
        if (edge.weight === 0) {
          nextDeque = [entry, ...nextDeque];
          correctAction = "front";
        } else {
          nextDeque = [...nextDeque, entry];
          correctAction = "back";
        }
      }
      frames.push({ step: step++, stage: "edge", status: "processing", currentNode: popped.id, edgeIndex: index, edge, dist: { ...dist }, deque: [...deque], candidate, improved, correctAction, nextDeque, nextDist, title: improved ? `Relax ${edge.from} → ${edge.to}` : `Keep ${edge.to} where it is`, explanation: improved ? `The candidate distance improves ${edge.to}. Weight-${edge.weight} work is inserted at the ${correctAction}.` : `The candidate is not smaller than d[${edge.to}], so no deque insertion is needed.` });
      if (improved) {
        dist[edge.to] = candidate;
        deque = nextDeque;
      }
    }
  }

  frames.push({ step: step++, stage: "complete", status: "complete", currentNode: null, edgeIndex: null, edge: null, dist: { ...dist }, deque: [], candidate: null, improved: false, correctAction: null, nextDeque: [], nextDist: { ...dist }, title: "Deque exhausted", explanation: "Every reachable vertex has been processed in non-decreasing distance order. This is the invariant that lets 0–1 BFS replace a heap." });
  return frames;
}

function formatDistance(value: number): string {
  return value === Infinity ? "∞" : String(value);
}
