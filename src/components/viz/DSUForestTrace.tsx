"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type DSUFrame = {
  parent: number[];
  rank: number[];
  components: number;
  operation: string;
  active: number[];
  path: number[];
  status: "ready" | "running" | "complete";
  explanation: string;
};

export function buildDSUFrames(): DSUFrame[] {
  const parent = [0, 1, 2, 3, 4];
  const rank = [0, 0, 0, 0, 0];
  let components = 5;
  const frames: DSUFrame[] = [];
  const push = (operation: string, active: number[], path: number[], status: DSUFrame["status"], explanation: string) => {
    frames.push({ parent: [...parent], rank: [...rank], components, operation, active: [...active], path: [...path], status, explanation });
  };
  const find = (x: number): number => {
    const path: number[] = [x];
    let root = x;
    while (parent[root] !== root) {
      root = parent[root];
      path.push(root);
    }
    for (const node of path) parent[node] = root;
    return root;
  };
  const union = (x: number, y: number) => {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return;
    if (rank[rx] < rank[ry]) {
      parent[rx] = ry;
    } else {
      parent[ry] = rx;
      if (rank[rx] === rank[ry]) rank[rx] += 1;
    }
    components -= 1;
  };

  push("ready", [], [], "ready", "Every node starts as its own representative; there are five components.");
  union(0, 1);
  push("union(0, 1)", [0, 1], [0, 1], "running", "Equal ranks attach 1 under 0 and increase rank(0); the component count drops to four.");
  union(2, 3);
  push("union(2, 3)", [2, 3], [2, 3], "running", "Equal ranks attach 3 under 2 and increase rank(2); the component count drops to three.");
  union(0, 2);
  push("union(0, 2)", [0, 2], [0, 2], "running", "Equal-rank roots merge, so 2 becomes a child of 0 and rank(0) becomes two.");
  const path = [3, 2, 0];
  find(3);
  push("find(3)", [3, 2, 0], path, "running", "Path compression rewires every visited node directly to root 0, shortening future finds.");
  union(1, 4);
  push("union(1, 4)", [1, 4, 0], [1, 0], "running", "Both nodes resolve to roots 0 and 4; attach 4 under the taller root and finish with one component.");
  push("complete", [0, 1, 2, 3, 4], [], "complete", "All five nodes now share representative 0. Union by rank controls height; path compression flattens finds.");
  return frames;
}

export function DSUForestTrace({ caption = "Disjoint-set union: rank, roots, and path compression" }: { caption?: string }) {
  const frames = React.useMemo(() => buildDSUFrames(), []);
  const [step, setStep] = React.useState(0);
  const frame = frames[step];

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)}>reset</VizButton>
          <VizButton disabled={step === 0} onClick={() => setStep((current) => current - 1)}>← prev</VizButton>
          <VizButton disabled={step === frames.length - 1} onClick={() => setStep((current) => current + 1)}>next →</VizButton>
          <VizButton onClick={() => setStep(frames.length - 1)}>finish</VizButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2" aria-label="Disjoint set parent table">
          {frame.parent.map((root, node) => (
            <div
              key={node}
              className="border p-2 text-center"
              style={{
                borderColor: frame.active.includes(node) ? PALETTE.primary : PALETTE.border,
                background: frame.path.includes(node) ? "color-mix(in srgb, var(--ink-ochre) 14%, transparent)" : undefined,
              }}
            >
              <div className="font-mono text-lg">{node}</div>
              <div className="font-mono text-[0.6rem] text-muted-foreground">parent → {root}</div>
              <div className="font-mono text-[0.6rem] text-muted-foreground">rank {frame.rank[node]}</div>
              <div className="font-mono text-[0.6rem]">{root === node ? "root" : "child"}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Current operation</div>
            <p className="mt-1 font-mono text-sm">{frame.operation}</p>
            <p className="mt-2 font-serif text-sm" aria-live="polite">{frame.explanation}</p>
          </div>
          <div className="border border-border p-3 font-mono text-xs">
            <div>step: {step + 1}/{frames.length}</div>
            <div>components: {frame.components}</div>
            <div>path: {frame.path.length ? frame.path.join(" → ") : "—"}</div>
            <div>status: {frame.status}</div>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
