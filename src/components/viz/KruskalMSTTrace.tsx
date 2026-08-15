import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type KruskalEdge = { from: string; to: string; weight: number };

type Action = "ready" | "consider" | "accept" | "reject" | "complete";

export type KruskalFrame = {
  action: Action;
  edge?: KruskalEdge;
  edges: KruskalEdge[];
  accepted: KruskalEdge[];
  parent: Record<string, string>;
  components: number;
  totalWeight: number;
  title: string;
  explanation: string;
};

const DEFAULT_EDGES: KruskalEdge[] = [
  { from: "A", to: "B", weight: 1 },
  { from: "C", to: "D", weight: 1 },
  { from: "B", to: "C", weight: 2 },
  { from: "D", to: "E", weight: 2 },
  { from: "A", to: "C", weight: 3 },
  { from: "B", to: "D", weight: 4 },
  { from: "C", to: "E", weight: 5 },
];

function cloneParent(parent: Record<string, string>) {
  return { ...parent };
}

function root(parent: Record<string, string>, node: string): string {
  let current = node;
  while (parent[current] !== current) current = parent[current];
  return current;
}

export function buildKruskalFrames(inputEdges: KruskalEdge[] = DEFAULT_EDGES): KruskalFrame[] {
  const edges = [...inputEdges].sort((a, b) => a.weight - b.weight || `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`));
  const nodes = [...new Set(edges.flatMap((edge) => [edge.from, edge.to]))].sort();
  const parent = Object.fromEntries(nodes.map((node) => [node, node]));
  const accepted: KruskalEdge[] = [];
  let components = nodes.length;
  let totalWeight = 0;
  const frames: KruskalFrame[] = [{
    action: "ready",
    edges,
    accepted: [],
    parent: cloneParent(parent),
    components,
    totalWeight,
    title: "Kruskal starts with separate components",
    explanation: "Edges are sorted by weight. The next edge is safe only when its endpoints have different DSU representatives.",
  }];

  for (const edge of edges) {
    const fromRoot = root(parent, edge.from);
    const toRoot = root(parent, edge.to);
    frames.push({
      action: "consider",
      edge,
      edges,
      accepted: [...accepted],
      parent: cloneParent(parent),
      components,
      totalWeight,
      title: `Consider ${edge.from}–${edge.to} (${edge.weight})`,
      explanation: `${edge.from} belongs to ${fromRoot} and ${edge.to} belongs to ${toRoot}. Compare representatives before deciding whether this edge would create a cycle.`,
    });

    if (fromRoot === toRoot) {
      frames.push({
        action: "reject",
        edge,
        edges,
        accepted: [...accepted],
        parent: cloneParent(parent),
        components,
        totalWeight,
        title: `Reject ${edge.from}–${edge.to}: cycle`,
        explanation: `Both endpoints already resolve to ${fromRoot}. Accepting this edge would close a cycle, so Kruskal skips it.`,
      });
      continue;
    }

    parent[toRoot] = fromRoot;
    accepted.push(edge);
    components -= 1;
    totalWeight += edge.weight;
    frames.push({
      action: "accept",
      edge,
      edges,
      accepted: [...accepted],
      parent: cloneParent(parent),
      components,
      totalWeight,
      title: `Accept ${edge.from}–${edge.to}`,
      explanation: `The representatives differ, so this edge joins two components. The forest now has ${components} component${components === 1 ? "" : "s"}.`,
    });
  }

  frames.push({
    action: "complete",
    edges,
    accepted: [...accepted],
    parent: cloneParent(parent),
    components,
    totalWeight,
    title: "Minimum spanning tree complete",
    explanation: `Every vertex is connected with total weight ${totalWeight}. Rejected edges were exactly the cycle-forming choices.`,
  });
  return frames;
}

export function KruskalMSTTrace({
  edges = DEFAULT_EDGES,
  caption = "Kruskal MST: accept safe edges, reject cycles",
}: {
  edges?: KruskalEdge[];
  caption?: string;
}) {
  const frames = React.useMemo(() => buildKruskalFrames(edges), [edges]);
  const [step, setStep] = React.useState(0);
  const frame = frames[Math.min(step, frames.length - 1)] ?? frames[0];

  const reset = () => setStep(0);
  const previous = () => setStep((current) => Math.max(0, current - 1));
  const next = () => setStep((current) => Math.min(frames.length - 1, current + 1));

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton ariaLabel="Reset Kruskal MST trace" onClick={reset} disabled={step === 0}>reset</VizButton>
        <VizButton ariaLabel="Previous Kruskal MST frame" onClick={previous} disabled={step === 0}>← prev</VizButton>
        <VizButton ariaLabel="Next Kruskal MST frame" onClick={next} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton ariaLabel="Finish Kruskal MST trace" onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Kruskal minimum spanning tree cycle gate">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="mb-0 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">Predict whether the next lightest edge joins two components or closes a cycle.</p>
          <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse font-mono text-sm" aria-label="Kruskal sorted edge decisions">
              <thead>
                <tr className="border-b text-left text-[0.65rem] uppercase tracking-[0.1em] text-[color:var(--pencil)]" style={{ borderColor: PALETTE.border }}>
                  <th className="p-2">edge</th><th className="p-2">weight</th><th className="p-2">decision</th>
                </tr>
              </thead>
              <tbody>
                {frame.edges.map((edge) => {
                  const accepted = frame.accepted.some((item) => item.from === edge.from && item.to === edge.to && item.weight === edge.weight);
                  const current = frame.edge?.from === edge.from && frame.edge?.to === edge.to && frame.edge.weight === edge.weight;
                  const rejected = current && frame.action === "reject";
                  return <tr key={`${edge.from}-${edge.to}-${edge.weight}`} style={{ background: current ? "color-mix(in srgb, var(--ink-ochre) 14%, transparent)" : "transparent" }}>
                    <td className="border-b p-2" style={{ borderColor: PALETTE.border }}>{edge.from}–{edge.to}</td>
                    <td className="border-b p-2 tabular-nums" style={{ borderColor: PALETTE.border }}>{edge.weight}</td>
                    <td className="border-b p-2" style={{ borderColor: PALETTE.border, color: rejected ? PALETTE.destructive : accepted ? PALETTE.c1 : PALETTE.muted }}>{rejected ? "rejected · cycle" : accepted ? "accepted" : current ? "consider" : "pending"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Forest state</div>
            <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
              <div><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">components</dt><dd className="mt-1 text-xl tabular-nums">{frame.components}</dd></div>
              <div><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">MST weight</dt><dd className="mt-1 text-xl tabular-nums">{frame.totalWeight}</dd></div>
            </dl>
            <div className="border-t pt-3" style={{ borderColor: PALETTE.border }}>
              <div className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">DSU representatives</div>
              <div className="flex flex-wrap gap-2" aria-label="DSU representative map">
                {Object.entries(frame.parent).map(([node, representative]) => <span key={node} className="border px-2 py-1 font-mono text-xs" style={{ borderColor: PALETTE.border }}>{node} → {representative}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.action === "reject" ? PALETTE.destructive : frame.action === "complete" ? PALETTE.c1 : PALETTE.c3 }} aria-live="polite">
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.action === "reject" ? PALETTE.destructive : frame.action === "complete" ? PALETTE.c1 : PALETTE.c3 }}>{frame.title}</span>
          {frame.explanation}
        </div>
      </section>
    </VizFrame>
  );
}
