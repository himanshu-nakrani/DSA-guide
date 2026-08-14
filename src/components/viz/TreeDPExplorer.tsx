"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type NodeId = "A" | "B" | "C" | "D" | "E";
type State = { include: number; exclude: number };
type Frame = {
  current: NodeId | "answer";
  computed: NodeId[];
  states: Partial<Record<NodeId, State>>;
  title: string;
  explanation: string;
  recurrence: string;
};

type NodeLayout = { id: NodeId; x: number; y: number; children: NodeId[] };

const NODES: NodeLayout[] = [
  { id: "A", x: 280, y: 48, children: ["B", "C"] },
  { id: "B", x: 160, y: 138, children: ["D"] },
  { id: "C", x: 400, y: 138, children: ["E"] },
  { id: "D", x: 112, y: 228, children: [] },
  { id: "E", x: 448, y: 228, children: [] },
];

const FRAMES: Frame[] = [
  {
    current: "D",
    computed: [],
    states: {},
    title: "Start at a leaf",
    explanation: "A leaf has no child choices. If we include D, we take one node; if we exclude D, we take none.",
    recurrence: "IN(D) = 1, OUT(D) = 0",
  },
  {
    current: "E",
    computed: ["D"],
    states: { D: { include: 1, exclude: 0 } },
    title: "Compute the other leaf",
    explanation: "E has the same base case. Bottom-up order means both child states are known before either parent is combined.",
    recurrence: "IN(E) = 1, OUT(E) = 0",
  },
  {
    current: "B",
    computed: ["D", "E"],
    states: { D: { include: 1, exclude: 0 }, E: { include: 1, exclude: 0 } },
    title: "Combine B with its child",
    explanation: "Including B forbids D, so we add OUT(D). Excluding B lets D choose its better state, max(IN(D), OUT(D)).",
    recurrence: "IN(B) = 1 + OUT(D) = 1; OUT(B) = max(1, 0) = 1",
  },
  {
    current: "C",
    computed: ["D", "E", "B"],
    states: { D: { include: 1, exclude: 0 }, E: { include: 1, exclude: 0 }, B: { include: 1, exclude: 1 } },
    title: "Combine C with its child",
    explanation: "C follows the same recurrence. Reusing this local rule at every node is exactly why the overall algorithm is linear.",
    recurrence: "IN(C) = 1 + OUT(E) = 1; OUT(C) = max(1, 0) = 1",
  },
  {
    current: "A",
    computed: ["D", "E", "B", "C"],
    states: {
      D: { include: 1, exclude: 0 }, E: { include: 1, exclude: 0 }, B: { include: 1, exclude: 1 }, C: { include: 1, exclude: 1 },
    },
    title: "Combine the root",
    explanation: "If A is included, both children must be excluded. If A is excluded, B and C independently keep their better state.",
    recurrence: "IN(A) = 1 + OUT(B) + OUT(C) = 3; OUT(A) = max(1, 1) + max(1, 1) = 2",
  },
  {
    current: "answer",
    computed: ["D", "E", "B", "C", "A"],
    states: {
      D: { include: 1, exclude: 0 }, E: { include: 1, exclude: 0 }, B: { include: 1, exclude: 1 }, C: { include: 1, exclude: 1 }, A: { include: 3, exclude: 2 },
    },
    title: "Read the root answer",
    explanation: "The maximum independent set has size 3. One optimal choice is {A, D, E}; every edge still has at most one selected endpoint.",
    recurrence: "answer = max(IN(A), OUT(A)) = max(3, 2) = 3",
  },
];

export function TreeDPExplorer({
  caption = "Tree DP state explorer: maximum independent set, computed bottom-up",
}: {
  caption?: string;
}) {
  const [step, setStep] = React.useState(0);
  const frame = FRAMES[step];

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
          <VizButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
          <VizButton onClick={() => setStep((current) => Math.min(FRAMES.length - 1, current + 1))} disabled={step === FRAMES.length - 1}>next →</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="Tree DP maximum independent set explorer">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">State per node u</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">
              <code className="font-mono text-[0.86em]">IN(u)</code> includes u; <code className="font-mono text-[0.86em]">OUT(u)</code> excludes u.
            </p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{FRAMES.length}</div>
        </div>

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_13rem]">
          <TreeDiagram frame={frame} />
          <StatePanel frame={frame} />
        </div>

        <div className="grid gap-3 md:grid-cols-[auto_1fr]">
          <div className="border px-3 py-2 font-mono text-[0.72rem] leading-relaxed text-[color:var(--ink)]" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            {frame.recurrence}
          </div>
          <div className="border px-3 py-2 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: PALETTE.border, background: "var(--surface-1)" }} aria-live="polite">
            <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--ink-blue)]">{frame.title}</span>
            {frame.explanation}
          </div>
        </div>
      </section>
    </VizFrame>
  );
}

function TreeDiagram({ frame }: { frame: Frame }) {
  const W = 560;
  const H = 286;
  const nodeById = new Map(NODES.map((node) => [node.id, node]));
  const computed = new Set(frame.computed);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Tree showing include and exclude dynamic-programming states">
        {NODES.flatMap((node) => node.children.map((child) => {
          const destination = nodeById.get(child)!;
          return <line key={`${node.id}-${child}`} x1={node.x} y1={node.y + 22} x2={destination.x} y2={destination.y - 22} stroke={PALETTE.border} strokeWidth="1.5" />;
        }))}
        {NODES.map((node) => {
          const state = frame.states[node.id];
          const isCurrent = frame.current === node.id;
          const isComputed = computed.has(node.id) || frame.current === "answer";
          const fill = isCurrent ? PALETTE.c3 : isComputed ? PALETTE.c1 : PALETTE.paper;
          const text = isCurrent || isComputed ? PALETTE.paper : PALETTE.ink;
          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r="22" fill={fill} stroke={PALETTE.ink} strokeWidth="1.5" />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={text}>{node.id}</text>
              {state && (isComputed || isCurrent) && (
                <g>
                  <rect x={node.x - 34} y={node.y + 30} width="68" height="29" fill="var(--surface-1)" stroke={PALETTE.border} strokeWidth="1" />
                  <text x={node.x} y={node.y + 42} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={PALETTE.ink}>IN {state.include}</text>
                  <text x={node.x} y={node.y + 53} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fill={PALETTE.ink}>OUT {state.exclude}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StatePanel({ frame }: { frame: Frame }) {
  const rows = NODES.filter((node) => frame.states[node.id]).map((node) => ({ id: node.id, state: frame.states[node.id]! }));
  return (
    <aside className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }} aria-label="Computed Tree DP states">
      <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Computed states</div>
      {rows.length === 0 ? (
        <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">Choose “next” to calculate leaf states before combining upward.</p>
      ) : (
        <dl className="m-0 space-y-2 font-mono text-[0.72rem]">
          {rows.map(({ id, state }) => (
            <div key={id} className="flex items-center justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: PALETTE.border }}>
              <dt className="text-[color:var(--ink)]">{id}</dt>
              <dd className="m-0 tabular-nums text-[color:var(--ink-soft)]">{state.include} / {state.exclude}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-3 mb-0 text-[0.68rem] leading-relaxed text-[color:var(--pencil)]">Each row shows IN / OUT.</p>
    </aside>
  );
}
