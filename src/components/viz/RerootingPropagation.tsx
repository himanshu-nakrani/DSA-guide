"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type RerootNode = "A" | "B" | "C" | "D" | "E";
export type RerootPhase = "subtree" | "root" | "propagate" | "complete";
export type RerootingFrame = {
  step: number;
  phase: RerootPhase;
  current: RerootNode | null;
  sizes: Partial<Record<RerootNode, number>>;
  subtreeDistance: Partial<Record<RerootNode, number>>;
  answers: Partial<Record<RerootNode, number>>;
  formula: string;
  title: string;
  explanation: string;
};

type NodeLayout = { id: RerootNode; x: number; y: number; parent: RerootNode | null; children: RerootNode[] };
const NODES: NodeLayout[] = [
  { id: "A", x: 280, y: 42, parent: null, children: ["B", "C"] },
  { id: "B", x: 160, y: 135, parent: "A", children: ["D"] },
  { id: "C", x: 400, y: 135, parent: "A", children: ["E"] },
  { id: "D", x: 112, y: 228, parent: "B", children: [] },
  { id: "E", x: 448, y: 228, parent: "C", children: [] },
];

export function buildRerootingFrames(): RerootingFrame[] {
  const sizes: Partial<Record<RerootNode, number>> = {};
  const subtreeDistance: Partial<Record<RerootNode, number>> = {};
  const answers: Partial<Record<RerootNode, number>> = {};
  const frames: RerootingFrame[] = [];
  let step = 0;
  const add = (frame: Omit<RerootingFrame, "step">) => frames.push({ ...frame, step: step++ });

  for (const node of ["D", "E", "B", "C", "A"] as RerootNode[]) {
    const layout = NODES.find((candidate) => candidate.id === node)!;
    const childSizes = layout.children.reduce((sum, child) => sum + (sizes[child] ?? 0), 0);
    const childDistances = layout.children.reduce((sum, child) => sum + (subtreeDistance[child] ?? 0) + (sizes[child] ?? 0), 0);
    sizes[node] = 1 + childSizes;
    subtreeDistance[node] = childDistances;
    add({
      phase: node === "A" ? "root" : "subtree", current: node, sizes: { ...sizes }, subtreeDistance: { ...subtreeDistance }, answers: { ...answers },
      formula: `size(${node}) = ${sizes[node]}; subDist(${node}) = ${subtreeDistance[node]}`,
      title: node === "A" ? "Root the tree at A" : `Compute subtree state for ${node}`,
      explanation: node === "A" ? "The bottom-up pass gives the size of every subtree and the distance sum from A to nodes in its own subtree. Because A is the root, that subtree is the whole tree." : "A node's subtree size is one plus its child sizes. Its internal distance sum adds each child's sum plus one edge to every node in that child subtree.",
    });
  }

  answers.A = subtreeDistance.A ?? 0;
  add({ phase: "root", current: "A", sizes: { ...sizes }, subtreeDistance: { ...subtreeDistance }, answers: { ...answers }, formula: `answer(A) = subDist(A) = ${answers.A}`, title: "Seed the all-tree answer", explanation: "The first DFS gives the sum of distances from A to every node. This is the seed that the second DFS will transport to every other root." });

  for (const node of ["B", "C", "D", "E"] as RerootNode[]) {
    const parent = NODES.find((candidate) => candidate.id === node)!.parent!;
    const childSize = sizes[node] ?? 0;
    answers[node] = (answers[parent] ?? 0) + NODES.length - 2 * childSize;
    add({ phase: "propagate", current: node, sizes: { ...sizes }, subtreeDistance: { ...subtreeDistance }, answers: { ...answers }, formula: `answer(${node}) = answer(${parent}) + n − 2·size(${node}) = ${answers[parent]} + 5 − 2·${childSize} = ${answers[node]}`, title: `Move the root A → ${node}`, explanation: `Crossing the ${parent}–${node} edge makes every node in ${node}'s subtree one step closer and every other node one step farther. The net change is n − 2·size(${node}).` });
  }

  add({ phase: "complete", current: null, sizes: { ...sizes }, subtreeDistance: { ...subtreeDistance }, answers: { ...answers }, formula: "answers = { A: 6, B: 7, C: 7, D: 10, E: 10 }", title: "Read every root answer", explanation: "One bottom-up pass plus one top-down propagation pass computes the distance sum for every possible root in linear time. No node needs a fresh DFS." });
  return frames;
}

export function RerootingPropagation({ caption = "Tree DP rerooting: propagate the answer across every edge" }: { caption?: string }) {
  const frames = React.useMemo(() => buildRerootingFrames(), []);
  const [step, setStep] = React.useState(0);
  const frame = frames[step];

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
        <VizButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Tree DP rerooting propagation explorer">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Goal: sum of distances from every possible root</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">First compute subtree sizes bottom-up. Then move the root across one edge at a time and update the answer without recomputing the tree.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="overflow-x-auto">
            <svg viewBox="0 0 560 300" className="w-full min-w-[32rem] h-auto" role="img" aria-label="Five-node tree with subtree sizes and propagated distance sums">
              {NODES.flatMap((node) => node.children.map((child) => { const destination = NODES.find((candidate) => candidate.id === child)!; return <line key={`${node.id}-${child}`} x1={node.x} y1={node.y + 22} x2={destination.x} y2={destination.y - 22} stroke={PALETTE.border} strokeWidth="1.5" />; }))}
              {NODES.map((node) => {
                const isCurrent = frame.current === node.id;
                const size = frame.sizes[node.id];
                const answer = frame.answers[node.id];
                const computed = size !== undefined || answer !== undefined;
                return <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="23" fill={isCurrent ? PALETTE.c3 : answer !== undefined ? PALETTE.c1 : computed ? PALETTE.c2 : PALETTE.paper} stroke={isCurrent ? PALETTE.ink : PALETTE.border} strokeWidth={isCurrent ? 2.5 : 1.5} />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={isCurrent || answer !== undefined || computed ? PALETTE.paper : PALETTE.ink}>{node.id}</text>
                  {(size !== undefined || answer !== undefined) && <g><rect x={node.x - 42} y={node.y + 31} width="84" height="31" fill="var(--surface-1)" stroke={PALETTE.border} strokeWidth="1" /><text x={node.x} y={node.y + 43} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={PALETTE.ink}>{size === undefined ? "size —" : `size ${size}`}</text><text x={node.x} y={node.y + 55} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={answer === undefined ? PALETTE.muted : PALETTE.ink}>{answer === undefined ? "ans —" : `ans ${answer}`}</text></g>}
                  {isCurrent && <text x={node.x} y={node.y - 32} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={PALETTE.ink}>{frame.phase === "propagate" ? "new root" : "current"}</text>}
                </g>;
              })}
            </svg>
          </div>
          <aside className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }} aria-label="Rerooting state table">
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">State at each node</div>
            <div className="space-y-2 font-mono text-[0.72rem]">{NODES.map((node) => <div key={node.id} className="border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: PALETTE.border }}><div className="flex justify-between"><span>{node.id}</span><span>size {frame.sizes[node.id] ?? "—"}</span></div><div className="mt-1 text-[color:var(--ink-soft)]">subDist {frame.subtreeDistance[node.id] ?? "—"} · answer {frame.answers[node.id] ?? "—"}</div></div>)}</div>
          </aside>
        </div>

        <div className="grid gap-3 md:grid-cols-[auto_1fr]">
          <div className="border px-3 py-2 font-mono text-[0.72rem] leading-relaxed text-[color:var(--ink)]" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>{frame.formula}</div>
          <div className="border-l-2 px-3 py-2 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.phase === "propagate" ? PALETTE.c3 : frame.phase === "complete" ? PALETTE.c1 : PALETTE.c2 }} aria-live="polite"><span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.phase === "propagate" ? PALETTE.c3 : frame.phase === "complete" ? PALETTE.c1 : PALETTE.primary }}>{frame.title}</span>{frame.explanation}</div>
        </div>
      </section>
    </VizFrame>
  );
}
