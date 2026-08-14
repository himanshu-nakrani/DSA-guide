"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type Mode = "acyclic" | "cycle";
type NodeId = "A" | "B" | "C" | "D" | "E";
type Edge = { from: NodeId; to: NodeId };
type Status = "ready" | "processing" | "complete" | "cycle";

type GraphState = {
  inDegree: Record<NodeId, number>;
  queue: NodeId[];
  processed: NodeId[];
  current: NodeId | null;
  status: Status;
  message: string;
};

const NODES: { id: NodeId; x: number; y: number }[] = [
  { id: "A", x: 82, y: 72 },
  { id: "B", x: 258, y: 72 },
  { id: "C", x: 170, y: 166 },
  { id: "D", x: 82, y: 258 },
  { id: "E", x: 258, y: 258 },
];

const BASE_EDGES: Edge[] = [
  { from: "A", to: "C" },
  { from: "B", to: "C" },
  { from: "C", to: "D" },
  { from: "C", to: "E" },
];

export function DAGScheduler({
  mode: initialMode = "acyclic",
  caption = "Kahn's algorithm: maintain the zero-in-degree frontier",
}: {
  mode?: Mode;
  caption?: string;
}) {
  const initialSafeMode: Mode = initialMode === "cycle" ? "cycle" : "acyclic";
  const [safeMode, setSafeMode] = React.useState<Mode>(initialSafeMode);
  const edges = React.useMemo<Edge[]>(() => safeMode === "cycle" ? [...BASE_EDGES, { from: "E", to: "B" }] : BASE_EDGES, [safeMode]);
  const initialState = React.useMemo(() => buildInitialState(edges), [edges]);
  const [state, setState] = React.useState<GraphState>(initialState);
  const [previousMode, setPreviousMode] = React.useState(initialSafeMode);

  if (previousMode !== initialSafeMode) {
    setPreviousMode(initialSafeMode);
    setSafeMode(initialSafeMode);
    setState(buildInitialState(initialSafeMode === "cycle" ? [...BASE_EDGES, { from: "E", to: "B" } as Edge] : BASE_EDGES));
  }

  const reset = () => setState(initialState);
  const selectNode = (node: NodeId) => setState((current) => advanceDAGState(current, edges, node));

  const available = new Set(state.queue);
  const processed = new Set(state.processed);

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <span role="group" aria-label="Graph variant" className="flex items-center gap-2">
            <VizButton active={safeMode === "acyclic"} onClick={() => { setSafeMode("acyclic"); setState(buildInitialState(BASE_EDGES)); }}>DAG</VizButton>
            <VizButton active={safeMode === "cycle"} onClick={() => { setSafeMode("cycle"); setState(buildInitialState([...BASE_EDGES, { from: "E", to: "B" }])); }}>cycle</VizButton>
          </span>
          <VizButton onClick={reset}>reset</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="Kahn topological sort scheduler">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Choose the next vertex</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">Only vertices with unresolved in-degree zero are safe to dequeue.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">processed {state.processed.length}/{NODES.length}</div>
        </div>

        <div className="space-y-3">
          <svg viewBox="0 0 340 330" className="w-full h-auto" role="img" aria-label="Directed dependency graph with current Kahn algorithm state">
            <defs>
              <marker id="dag-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L7,3.5 L0,7 z" fill={PALETTE.border} />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const from = NODES.find((node) => node.id === edge.from)!;
              const to = NODES.find((node) => node.id === edge.to)!;
              const isCycleEdge = safeMode === "cycle" && edge.from === "E" && edge.to === "B";
              const changed = state.current === edge.from;
              return (
                <line
                  key={`${edge.from}-${edge.to}-${index}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isCycleEdge && state.status === "cycle" ? PALETTE.destructive : changed ? PALETTE.c3 : PALETTE.border}
                  strokeWidth={isCycleEdge || changed ? 2.4 : 1.5}
                  markerEnd="url(#dag-arrow)"
                />
              );
            })}
            {NODES.map((node) => {
              const isCurrent = state.current === node.id;
              const isQueued = available.has(node.id);
              const isProcessed = processed.has(node.id);
              const isBlocked = state.status === "cycle" && !isProcessed;
              const fill = isBlocked ? "color-mix(in srgb, var(--ink-red) 14%, transparent)" : isCurrent ? PALETTE.c3 : isProcessed ? PALETTE.c1 : isQueued ? "color-mix(in srgb, var(--ink-blue) 14%, transparent)" : PALETTE.paper;
              return (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="23" fill={fill} stroke={isBlocked ? PALETTE.destructive : PALETTE.ink} strokeWidth="1.6" />
                  <text x={node.x} y={node.y + 5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="15" fill={isCurrent || isProcessed ? PALETTE.paper : PALETTE.ink}>{node.id}</text>
                  <text x={node.x} y={node.y - 32} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill={isBlocked ? PALETTE.destructive : PALETTE.muted}>in {state.inDegree[node.id]}</text>
                </g>
              );
            })}
          </svg>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
              <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">zero-in-degree queue</div>
              <div className="flex min-h-9 flex-wrap gap-2" aria-label="Available queue vertices">
                {state.queue.length === 0 ? <span className="font-mono text-xs italic text-[color:var(--pencil)]">empty</span> : state.queue.map((node) => <span key={node} className="border px-2 py-1 font-mono text-sm" style={{ borderColor: PALETTE.c1, color: PALETTE.c1 }}>{node}</span>)}
              </div>
            </div>
            <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-1)" }}>
              <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">choose a vertex</div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Choose next vertex">
                {NODES.map((node) => <VizButton key={node.id} onClick={() => selectNode(node.id)} active={available.has(node.id)} disabled={state.status === "complete"}>{node.id}{available.has(node.id) ? " · ready" : ""}</VizButton>)}
              </div>
            </div>
          </div>

          <div className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: state.status === "cycle" ? PALETTE.destructive : state.status === "complete" ? PALETTE.c1 : PALETTE.c3 }} aria-live="polite">
            <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: state.status === "cycle" ? PALETTE.destructive : PALETTE.c1 }}>{state.status}</span>
            <span className="text-[color:var(--ink-soft)]">{state.message}</span>
          </div>
          <div className="border px-3 py-2 font-mono text-[0.75rem] tabular-nums text-[color:var(--ink)]" style={{ borderColor: PALETTE.border }}>
            output: {state.processed.length ? state.processed.join(" → ") : "—"}
          </div>
        </div>
      </section>
    </VizFrame>
  );
}

export function advanceDAGState(state: GraphState, edges: Edge[], node: NodeId): GraphState {
  if (!state.queue.includes(node)) {
    return {
      ...state,
      message: state.processed.includes(node)
        ? `${node} has already been processed.`
        : `${node} is blocked: its in-degree is still ${state.inDegree[node]}. Choose a zero-in-degree vertex.`,
    };
  }

  const nextInDegree = { ...state.inDegree };
  const nextQueue = state.queue.filter((candidate) => candidate !== node);
  for (const edge of edges.filter((candidate) => candidate.from === node)) {
    nextInDegree[edge.to] -= 1;
    if (nextInDegree[edge.to] === 0) nextQueue.push(edge.to);
  }
  const nextProcessed = [...state.processed, node];
  const isComplete = nextProcessed.length === NODES.length;
  const isCycle = nextQueue.length === 0 && !isComplete;
  return {
    inDegree: nextInDegree,
    queue: nextQueue,
    processed: nextProcessed,
    current: node,
    status: isComplete ? "complete" : isCycle ? "cycle" : "processing",
    message: isComplete
      ? `Complete. ${nextProcessed.join(" → ")} is a valid topological order.`
      : isCycle
        ? "The frontier is empty before every vertex was processed. The remaining vertices contain a cycle."
        : `Processed ${node}; inspect the newly available zero-in-degree vertices.`,
  };
}

export function buildInitialState(edges: Edge[]): GraphState {
  const inDegree: Record<NodeId, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (const edge of edges) inDegree[edge.to] += 1;
  return {
    inDegree,
    queue: NODES.map((node) => node.id).filter((node) => inDegree[node] === 0),
    processed: [],
    current: null,
    status: "ready",
    message: "Choose any available vertex. Different valid choices can produce different topological orders.",
  };
}
