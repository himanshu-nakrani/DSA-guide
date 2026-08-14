"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type LazyHeapEdge = { from: string; to: string; weight: number };
export type LazyHeapEntry = { node: string; distance: number };
export type LazyHeapFrame = {
  heap: LazyHeapEntry[];
  dist: Record<string, number>;
  settled: string[];
  activeNode: string | null;
  activeEdge: LazyHeapEdge | null;
  action: "ready" | "push" | "pop" | "stale" | "settle" | "relax" | "complete";
  status: "ready" | "running" | "complete";
  explanation: string;
};

const DEFAULT_EDGES: LazyHeapEdge[] = [
  { from: "A", to: "B", weight: 10 },
  { from: "A", to: "C", weight: 3 },
  { from: "C", to: "B", weight: 1 },
  { from: "B", to: "D", weight: 2 },
  { from: "C", to: "D", weight: 8 },
  { from: "D", to: "E", weight: 2 },
];

const NODES = ["A", "B", "C", "D", "E"];

function cloneHeap(heap: LazyHeapEntry[]) {
  return heap.map((entry) => ({ ...entry }));
}

function cloneDist(dist: Record<string, number>) {
  return { ...dist };
}

function compareEntries(a: LazyHeapEntry, b: LazyHeapEntry) {
  return a.distance - b.distance || a.node.localeCompare(b.node);
}

export function buildLazyHeapFrames(edges: LazyHeapEdge[] = DEFAULT_EDGES, source = "A"): LazyHeapFrame[] {
  const adjacency = new Map<string, LazyHeapEdge[]>();
  for (const node of NODES) adjacency.set(node, []);
  for (const edge of edges) adjacency.get(edge.from)?.push(edge);

  const dist: Record<string, number> = Object.fromEntries(NODES.map((node) => [node, Infinity]));
  dist[source] = 0;
  const settled: string[] = [];
  const heap: LazyHeapEntry[] = [{ node: source, distance: 0 }];
  const frames: LazyHeapFrame[] = [];
  const push = (
    action: LazyHeapFrame["action"],
    activeNode: string | null,
    activeEdge: LazyHeapEdge | null,
    explanation: string,
  ) => {
    frames.push({
      heap: cloneHeap(heap),
      dist: cloneDist(dist),
      settled: [...settled],
      activeNode,
      activeEdge,
      action,
      status: action === "complete" ? "complete" : action === "ready" ? "ready" : "running",
      explanation,
    });
  };

  push("ready", null, null, `The heap starts with only the source ${source}. Every improvement gets a new entry; no decrease-key is required.`);

  while (heap.length) {
    heap.sort(compareEntries);
    const entry = heap.shift()!;
    push("pop", entry.node, null, `Pop (${entry.distance}, ${entry.node}), the smallest heap entry currently available.`);
    if (entry.distance > dist[entry.node]) {
      push("stale", entry.node, null, `This entry is stale: dist[${entry.node}] is already ${dist[entry.node]}, which is smaller than ${entry.distance}. Skip it.`);
      continue;
    }
    if (settled.includes(entry.node)) {
      push("stale", entry.node, null, `${entry.node} is already settled, so this duplicate heap entry cannot improve the answer. Skip it.`);
      continue;
    }
    settled.push(entry.node);
    push("settle", entry.node, null, `The fresh minimum is safe to settle because all edge weights are non-negative.`);

    for (const edge of adjacency.get(entry.node) ?? []) {
      if (settled.includes(edge.to)) continue;
      push("relax", edge.from, edge, `Test ${dist[edge.from]} + ${edge.weight} < ${dist[edge.to] === Infinity ? "∞" : dist[edge.to]}.`);
      const candidate = dist[edge.from] + edge.weight;
      if (candidate < dist[edge.to]) {
        dist[edge.to] = candidate;
        heap.push({ node: edge.to, distance: candidate });
        push("push", edge.to, edge, `Improvement accepted: push (${candidate}, ${edge.to}). An older entry for ${edge.to} may remain and later become stale.`);
      }
    }
  }

  push("complete", null, null, "The heap is empty. Every reachable node is settled, and stale entries were ignored without affecting the shortest distances.");
  return frames;
}

export function DijkstraLazyHeapTrace({
  caption = "Dijkstra's lazy heap: fresh entries versus stale entries",
  edges = DEFAULT_EDGES,
  source = "A",
}: {
  caption?: string;
  edges?: LazyHeapEdge[];
  source?: string;
}) {
  const frames = React.useMemo(() => buildLazyHeapFrames(edges, source), [edges, source]);
  const [step, setStep] = React.useState(0);
  const frame = frames[step];
  const nodes = Object.keys(frame.dist);

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton ariaLabel="Reset Dijkstra lazy-heap trace" onClick={() => setStep(0)}>reset</VizButton>
          <VizButton ariaLabel="Previous Dijkstra lazy-heap frame" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>← prev</VizButton>
          <VizButton ariaLabel="Next Dijkstra lazy-heap frame" disabled={step === frames.length - 1} onClick={() => setStep((current) => current + 1)}>next →</VizButton>
          <VizButton ariaLabel="Finish Dijkstra lazy-heap trace" onClick={() => setStep(frames.length - 1)}>finish</VizButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Priority queue entries">
          {frame.heap.length ? frame.heap.map((entry, index) => (
            <div key={`${entry.node}-${entry.distance}-${index}`} className="border border-[color:var(--ink-blue)] px-2 py-1 font-mono text-xs">
              ({entry.distance}, {entry.node})
            </div>
          )) : <span className="font-mono text-xs text-muted-foreground">empty</span>}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Heap action</div>
            <p className="mt-1 font-mono text-sm">{frame.action}</p>
            <p className="mt-2 font-serif text-sm" aria-live="polite">{frame.explanation}</p>
          </div>
          <div className="border border-border p-3 font-mono text-xs">
            <div>step: {step + 1}/{frames.length}</div>
            <div>active node: {frame.activeNode ?? "—"}</div>
            <div>settled: {frame.settled.length ? frame.settled.join(", ") : "—"}</div>
            <div>status: {frame.status}</div>
          </div>
        </div>
        <table className="w-full font-mono text-xs" aria-label="Dijkstra distance table">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-1">node</th>
              <th className="py-1">distance</th>
              <th className="py-1">state</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node} className="border-b border-border/60">
                <td className="py-1" style={{ color: frame.activeNode === node ? PALETTE.primary : undefined }}>{node}</td>
                <td className="py-1">{frame.dist[node] === Infinity ? "∞" : frame.dist[node]}</td>
                <td className="py-1 text-muted-foreground">{frame.settled.includes(node) ? "settled" : frame.activeNode === node ? frame.action : "tentative"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="font-mono text-xs text-muted-foreground">
          Stale entries are expected in a lazy heap. The guard is <code>d &gt; dist[u]</code>, not a heap mutation.
        </div>
      </div>
    </VizFrame>
  );
}
