"use client";

import * as React from "react";
import { ComplexityChart } from "./ComplexityChart";
import { ArrayMemory } from "./ArrayMemory";
import { BinarySearchPlayer } from "./BinarySearchPlayer";
import { LinearVsBinary } from "./LinearVsBinary";
import { TwoPointers } from "./TwoPointers";
import { SlidingWindow } from "./SlidingWindow";
import { HashTableViz } from "./HashTableViz";
import { LinkedList } from "./LinkedList";
import { StackQueue } from "./StackQueue";
import { TreeTraversal } from "./TreeTraversal";
import { GraphTraversal } from "./GraphTraversal";
import { DPGrid } from "./DPGrid";
import { DijkstraViz } from "./DijkstraViz";
import { RecursionTree } from "./RecursionTree";
import { Architecture } from "./Architecture";
import { GrowthTable } from "./GrowthTable";
import { Callout } from "./Callout";

/**
 * Viz: the single entry point used by the markdown renderer.
 * A fenced ```viz block in an article carries `{ "type": "...", "props": {...} }`.
 * We dispatch through this registry so authors don't import components.
 */
const REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  "complexity-chart": ComplexityChart as React.ComponentType<Record<string, unknown>>,
  "growth-table": GrowthTable as React.ComponentType<Record<string, unknown>>,
  "array-memory": ArrayMemory as React.ComponentType<Record<string, unknown>>,
  "binary-search": BinarySearchPlayer as React.ComponentType<Record<string, unknown>>,
  "linear-vs-binary": LinearVsBinary as React.ComponentType<Record<string, unknown>>,
  "two-pointers": TwoPointers as React.ComponentType<Record<string, unknown>>,
  "sliding-window": SlidingWindow as React.ComponentType<Record<string, unknown>>,
  "hash-table": HashTableViz as React.ComponentType<Record<string, unknown>>,
  "linked-list": LinkedList as React.ComponentType<Record<string, unknown>>,
  "stack-queue": StackQueue as React.ComponentType<Record<string, unknown>>,
  "tree-traversal": TreeTraversal as React.ComponentType<Record<string, unknown>>,
  "graph-traversal": GraphTraversal as React.ComponentType<Record<string, unknown>>,
  "dp-grid": DPGrid as React.ComponentType<Record<string, unknown>>,
  "dijkstra": DijkstraViz as React.ComponentType<Record<string, unknown>>,
  "recursion-tree": RecursionTree as React.ComponentType<Record<string, unknown>>,
  "architecture": Architecture as React.ComponentType<Record<string, unknown>>,
  "callout": Callout as React.ComponentType<Record<string, unknown>>,
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
  const Component = REGISTRY[parsed.type];
  if (!Component) {
    return <VizError message={`Unknown viz type: ${parsed.type}`} detail={raw} />;
  }
  return (
    <figure className="viz not-prose my-8">
      <Component {...(parsed.props ?? {})} />
    </figure>
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
