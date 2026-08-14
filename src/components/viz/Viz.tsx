"use client";

import * as React from "react";
import { Callout } from "./Callout";

/**
 * Viz: the single entry point used by the markdown renderer.
 * A fenced ```viz block in an article carries `{ "type": "...", "props": {...} }`.
 * We dispatch through this registry so authors don't import components.
 *
 * Each non-trivial viz is React.lazy'd so an article that uses only one viz
 * type doesn't pay for the other eighteen in its JS bundle. Callout is
 * imported eagerly because it's tiny and frequently used as a margin note.
 */
type LazyViz = React.LazyExoticComponent<
  React.ComponentType<Record<string, unknown>>
>;

const REGISTRY: Record<string, LazyViz> = {
  "complexity-chart": React.lazy(() =>
    import("./ComplexityChart").then((m) => ({ default: m.ComplexityChart as React.ComponentType<Record<string, unknown>> })),
  ),
  "growth-table": React.lazy(() =>
    import("./GrowthTable").then((m) => ({ default: m.GrowthTable as React.ComponentType<Record<string, unknown>> })),
  ),
  "array-memory": React.lazy(() =>
    import("./ArrayMemory").then((m) => ({ default: m.ArrayMemory as React.ComponentType<Record<string, unknown>> })),
  ),
  "binary-search": React.lazy(() =>
    import("./BinarySearchPlayer").then((m) => ({ default: m.BinarySearchPlayer as React.ComponentType<Record<string, unknown>> })),
  ),
  "linear-vs-binary": React.lazy(() =>
    import("./LinearVsBinary").then((m) => ({ default: m.LinearVsBinary as React.ComponentType<Record<string, unknown>> })),
  ),
  "two-pointers": React.lazy(() =>
    import("./TwoPointers").then((m) => ({ default: m.TwoPointers as React.ComponentType<Record<string, unknown>> })),
  ),
  "sliding-window": React.lazy(() =>
    import("./SlidingWindow").then((m) => ({ default: m.SlidingWindow as React.ComponentType<Record<string, unknown>> })),
  ),
  "hash-table": React.lazy(() =>
    import("./HashTableViz").then((m) => ({ default: m.HashTableViz as React.ComponentType<Record<string, unknown>> })),
  ),
  "linked-list": React.lazy(() =>
    import("./LinkedList").then((m) => ({ default: m.LinkedList as React.ComponentType<Record<string, unknown>> })),
  ),
  "stack-queue": React.lazy(() =>
    import("./StackQueue").then((m) => ({ default: m.StackQueue as React.ComponentType<Record<string, unknown>> })),
  ),
  "tree-traversal": React.lazy(() =>
    import("./TreeTraversal").then((m) => ({ default: m.TreeTraversal as React.ComponentType<Record<string, unknown>> })),
  ),
  "graph-traversal": React.lazy(() =>
    import("./GraphTraversal").then((m) => ({ default: m.GraphTraversal as React.ComponentType<Record<string, unknown>> })),
  ),
  "dp-grid": React.lazy(() =>
    import("./DPGrid").then((m) => ({ default: m.DPGrid as React.ComponentType<Record<string, unknown>> })),
  ),
  "dijkstra": React.lazy(() =>
    import("./DijkstraViz").then((m) => ({ default: m.DijkstraViz as React.ComponentType<Record<string, unknown>> })),
  ),
  "recursion-tree": React.lazy(() =>
    import("./RecursionTree").then((m) => ({ default: m.RecursionTree as React.ComponentType<Record<string, unknown>> })),
  ),
  "architecture": React.lazy(() =>
    import("./Architecture").then((m) => ({ default: m.Architecture as React.ComponentType<Record<string, unknown>> })),
  ),
  "invariant-trace": React.lazy(() =>
    import("./InvariantTrace").then((m) => ({ default: m.InvariantTrace as React.ComponentType<Record<string, unknown>> })),
  ),
  "knowledge-check": React.lazy(() =>
    import("./KnowledgeCheck").then((m) => ({ default: m.KnowledgeCheck as React.ComponentType<Record<string, unknown>> })),
  ),
  "proof-builder": React.lazy(() =>
    import("./ProofBuilder").then((m) => ({ default: m.ProofBuilder as React.ComponentType<Record<string, unknown>> })),
  ),
  "tree-dp": React.lazy(() =>
    import("./TreeDPExplorer").then((m) => ({ default: m.TreeDPExplorer as React.ComponentType<Record<string, unknown>> })),
  ),
  "dag-scheduler": React.lazy(() =>
    import("./DAGScheduler").then((m) => ({ default: m.DAGScheduler as React.ComponentType<Record<string, unknown>> })),
  ),
  "bellman-ford-pass": React.lazy(() =>
    import("./BellmanFordPass").then((m) => ({ default: m.BellmanFordPass as React.ComponentType<Record<string, unknown>> })),
  ),
  "dp-decision-trace": React.lazy(() =>
    import("./DPDecisionTrace").then((m) => ({ default: m.DPDecisionTrace as React.ComponentType<Record<string, unknown>> })),
  ),
  "edit-path-reconstructor": React.lazy(() =>
    import("./EditPathReconstructor").then((m) => ({ default: m.EditPathReconstructor as React.ComponentType<Record<string, unknown>> })),
  ),
};

export function Viz({ raw }: { raw: string }) {
  let parsed: { type?: string; props?: Record<string, unknown> } | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return <VizError message="Invalid JSON in viz block" detail={raw} />;
  }
  if (!parsed || !parsed.type) {
    return <VizError message="Viz block missing `type`" detail={raw} />;
  }
  // Callouts already render as semantic <aside>s; wrapping them in a <figure>
  // would (a) break the `.essay > .annotation` selector that slots them into
  // the desktop marginalia gutter and (b) add a second visual frame around
  // what is already an editorial side-note. Kept eagerly imported because
  // it's small and shows up in nearly every article.
  if (parsed.type === "callout") {
    return <Callout {...(parsed.props ?? {})} />;
  }
  const Component = REGISTRY[parsed.type];
  if (!Component) {
    return <VizError message={`Unknown viz type: ${parsed.type}`} detail={raw} />;
  }
  return (
    <figure className="viz not-prose my-8">
      <React.Suspense fallback={<VizSkeleton />}>
        <Component {...(parsed.props ?? {})} />
      </React.Suspense>
    </figure>
  );
}

function VizSkeleton() {
  return (
    <div
      className="animate-pulse rounded-sm border border-[color:var(--rule)]"
      style={{ background: "var(--surface-1)", minHeight: 220 }}
      aria-label="Loading figure"
    />
  );
}

function VizError({ message, detail }: { message: string; detail: string }) {
  return (
    <div className="my-6 rounded border border-destructive/60 bg-destructive/5 p-4 text-sm">
      <div className="font-mono text-xs uppercase tracking-wider text-destructive mb-2">
        Visualization error
      </div>
      <div className="font-serif">{message}</div>
      <pre className="mt-2 overflow-x-auto text-xs opacity-60">{detail}</pre>
    </div>
  );
}
