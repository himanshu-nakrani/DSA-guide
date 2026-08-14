"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type Cell = { i: number; j: number };
type OperationKind = "match" | "replace" | "delete" | "insert";

export type EditPathOperation = {
  kind: OperationKind;
  source: string;
  target: string;
  cost: number;
  fromCell: Cell;
  toCell: Cell;
  explanation: string;
};

export type EditPathFrame = {
  step: number;
  current: Cell;
  operation: EditPathOperation | null;
  operations: EditPathOperation[];
  grid: number[][];
  distance: number;
};

const DEFAULT_SOURCE = "kitten";
const DEFAULT_TARGET = "sitting";
const MAX_LENGTH = 12;

export function EditPathReconstructor({
  a = DEFAULT_SOURCE,
  b = DEFAULT_TARGET,
  caption = "Edit-distance path reconstructor: walk the completed table backward",
}: {
  a?: string;
  b?: string;
  caption?: string;
}) {
  const safeA = normalizeInput(a, DEFAULT_SOURCE);
  const safeB = normalizeInput(b, DEFAULT_TARGET);
  const frames = React.useMemo(() => buildEditPathFrames(safeA, safeB), [safeA, safeB]);
  const inputSignature = `${safeA}\u0000${safeB}`;
  const [step, setStep] = React.useState(0);
  const [previousInputs, setPreviousInputs] = React.useState(inputSignature);

  if (previousInputs !== inputSignature) {
    setPreviousInputs(inputSignature);
    setStep(0);
  }

  const activeStep = Math.min(step, frames.length - 1);
  const frame = frames[activeStep];
  const complete = activeStep === frames.length - 1;
  const sourceLabels = ["∅", ...safeA.split("")];
  const targetLabels = ["∅", ...safeB.split("")];

  const goTo = (nextStep: number) => {
    setStep(Math.max(0, Math.min(frames.length - 1, nextStep)));
  };

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => goTo(0)} disabled={activeStep === 0}>reset</VizButton>
          <VizButton onClick={() => goTo(activeStep - 1)} disabled={activeStep === 0}>← prev</VizButton>
          <VizButton onClick={() => goTo(activeStep + 1)} disabled={complete}>next →</VizButton>
          <VizButton onClick={() => goTo(frames.length - 1)} disabled={complete}>finish</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="Edit-distance path reconstruction">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">
              Walk backward from the answer
            </div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">
              The table already contains the optimal distance. Follow one minimum predecessor at a time to recover the actual edits.
            </p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">
            step {activeStep}/{frames.length - 1}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          <span className="border px-2 py-1" style={{ borderColor: PALETTE.border }}>source: {safeA || "∅"}</span>
          <span aria-hidden="true" style={{ color: PALETTE.muted }}>→</span>
          <span className="border px-2 py-1" style={{ borderColor: PALETTE.border }}>target: {safeB || "∅"}</span>
          <span className="ml-auto border px-2 py-1 tabular-nums" style={{ borderColor: PALETTE.c3, background: "color-mix(in srgb, var(--ink-ochre) 12%, transparent)" }}>
            distance: {frame.distance}
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] items-start">
          <div className="overflow-x-auto" aria-label="Completed edit-distance dynamic programming table">
            <table className="border-collapse font-mono text-sm">
              <caption className="sr-only">Edit-distance table for transforming {safeA || "the empty string"} into {safeB || "the empty string"}</caption>
              <thead>
                <tr>
                  <th className="w-10 h-10" aria-hidden="true" />
                  {targetLabels.map((label, j) => (
                    <th key={`target-${j}`} className="w-10 h-10 border-b font-medium text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground" style={{ borderColor: PALETTE.border }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sourceLabels.map((label, i) => (
                  <tr key={`source-${i}`}>
                    <th className="w-10 h-10 border-r pr-1 text-right font-medium text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground" style={{ borderColor: PALETTE.border }}>
                      {label}
                    </th>
                    {targetLabels.map((_, j) => {
                      const current = sameCell(frame.current, { i, j });
                      const departed = frame.operation !== null && sameCell(frame.operation.fromCell, { i, j });
                      const onPath = frame.operations.some((operation) => sameCell(operation.toCell, { i, j })) || (complete && i === safeA.length && j === safeB.length);
                      return (
                        <td
                          key={`cell-${i}-${j}`}
                          className="w-10 h-10 border text-center tabular-nums transition-colors"
                          style={{
                            borderColor: PALETTE.border,
                            background: current ? PALETTE.c3 : departed ? "color-mix(in srgb, var(--ink-ochre) 18%, transparent)" : onPath ? "color-mix(in srgb, var(--ink-blue) 10%, transparent)" : "transparent",
                            color: current ? PALETTE.paper : PALETTE.ink,
                            fontWeight: current || departed ? 700 : 400,
                          }}
                          aria-label={`dp[${i}][${j}] = ${frame.grid[i][j]}${current ? ", current cell" : ""}`}
                        >
                          {frame.grid[i][j]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border p-3 text-sm leading-relaxed" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Current cell</div>
            <div className="font-mono tabular-nums text-[color:var(--ink)]">dp[{frame.current.i}][{frame.current.j}] = {frame.grid[frame.current.i][frame.current.j]}</div>
            <div className="mt-3 border-t pt-3" style={{ borderColor: PALETTE.border }}>
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--ink-blue)]">Transition</div>
              <p className="mt-1 mb-0 text-[color:var(--ink-soft)]">
                {frame.operation === null ? "Start here: the bottom-right cell is the final edit distance." : `dp[${frame.operation.fromCell.i}][${frame.operation.fromCell.j}] → dp[${frame.operation.toCell.i}][${frame.operation.toCell.j}]`}
              </p>
            </div>
            <div className="mt-3 border-t pt-3" style={{ borderColor: PALETTE.border }}>
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--ink-blue)]">Rule</div>
              <p className="mt-1 mb-0 text-[color:var(--ink-soft)]">Choose a predecessor with the smallest table value; ties use replace, then delete, then insert.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
          <div className="border p-3" style={{ borderColor: frame.operation ? PALETTE.c1 : PALETTE.border, background: "var(--surface-1)" }} aria-live="polite">
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Latest backtrack move</div>
            {frame.operation === null ? (
              <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">Press <strong>next</strong> to choose the predecessor that explains the final cell.</p>
            ) : (
              <>
                <div className="font-mono text-sm uppercase tracking-[0.12em]" style={{ color: PALETTE.c1 }}>{frame.operation.kind}</div>
                <p className="mt-1 mb-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">{frame.operation.explanation}</p>
                <div className="mt-2 font-mono text-xs tabular-nums text-[color:var(--pencil)]">cost +{frame.operation.cost} · dp[{frame.operation.toCell.i}][{frame.operation.toCell.j}] = {frame.grid[frame.operation.toCell.i][frame.operation.toCell.j]}</div>
              </>
            )}
          </div>

          <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-1)" }}>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Recovered operations · forward order</div>
            {frame.operations.length === 0 ? (
              <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">No operations recovered yet. The path is being read from target back to source.</p>
            ) : (
              <ol className="m-0 space-y-1 pl-5 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                {frame.operations.map((operation, index) => (
                  <li key={`${operation.kind}-${operation.fromCell.i}-${operation.fromCell.j}-${index}`}>
                    <span className="font-mono uppercase" style={{ color: operation.kind === "match" ? PALETTE.muted : PALETTE.c1 }}>{operation.kind}</span>{" "}
                    {operation.source || "∅"} → {operation.target || "∅"}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: complete ? PALETTE.c1 : PALETTE.c3 }}>
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: complete ? PALETTE.c1 : PALETTE.c3 }}>{complete ? "Recovered" : "Why"}</span>
          {complete ? `The backward walk reached dp[0][0]. Apply the ${frame.operations.filter((operation) => operation.kind !== "match").length} edit${frame.operations.filter((operation) => operation.kind !== "match").length === 1 ? "" : "s"} shown above from left to right.` : "Every move preserves an optimal suffix-to-prefix distance because it follows a minimum predecessor in the completed table."}
        </div>
      </section>
    </VizFrame>
  );
}

export function buildEditPathFrames(a: string, b: string): EditPathFrame[] {
  const grid = buildEditDistanceTable(a, b);
  const distance = grid[a.length][b.length];
  const frames: EditPathFrame[] = [{ step: 0, current: { i: a.length, j: b.length }, operation: null, operations: [], grid, distance }];
  const backwardOperations: EditPathOperation[] = [];
  let current: Cell = { i: a.length, j: b.length };

  while (current.i > 0 || current.j > 0) {
    const operation = chooseOperation(a, b, grid, current);
    backwardOperations.push(operation);
    current = operation.toCell;
    frames.push({ step: frames.length, current, operation, operations: [...backwardOperations].reverse(), grid, distance });
  }

  return frames;
}

function buildEditDistanceTable(a: string, b: string): number[][] {
  const grid: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) grid[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) grid[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        grid[i][j] = grid[i - 1][j - 1];
      } else {
        grid[i][j] = 1 + Math.min(grid[i - 1][j - 1], grid[i - 1][j], grid[i][j - 1]);
      }
    }
  }
  return grid;
}

function chooseOperation(a: string, b: string, grid: number[][], current: Cell): EditPathOperation {
  const { i, j } = current;
  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    return {
      kind: "match",
      source: a[i - 1],
      target: b[j - 1],
      cost: 0,
      fromCell: current,
      toCell: { i: i - 1, j: j - 1 },
      explanation: `Keep “${a[i - 1]}”: the source and target characters match, so the path follows the diagonal at no cost.`,
    };
  }

  const candidates: Array<{ operation: EditPathOperation; value: number }> = [];
  if (i > 0 && j > 0) {
    candidates.push({
      value: grid[i - 1][j - 1],
      operation: {
        kind: "replace",
        source: a[i - 1],
        target: b[j - 1],
        cost: 1,
        fromCell: current,
        toCell: { i: i - 1, j: j - 1 },
        explanation: `Replace “${a[i - 1]}” with “${b[j - 1]}”: the diagonal predecessor is part of an optimal path.`,
      },
    });
  }
  if (i > 0) {
    candidates.push({
      value: grid[i - 1][j],
      operation: {
        kind: "delete",
        source: a[i - 1],
        target: "",
        cost: 1,
        fromCell: current,
        toCell: { i: i - 1, j },
        explanation: `Delete “${a[i - 1]}” from the source: move up to the predecessor that keeps the target prefix unchanged.`,
      },
    });
  }
  if (j > 0) {
    candidates.push({
      value: grid[i][j - 1],
      operation: {
        kind: "insert",
        source: "",
        target: b[j - 1],
        cost: 1,
        fromCell: current,
        toCell: { i, j: j - 1 },
        explanation: `Insert “${b[j - 1]}” into the source: move left to keep the source prefix unchanged.`,
      },
    });
  }

  const best = candidates.reduce((winner, candidate) => candidate.value < winner.value ? candidate : winner);
  return best.operation;
}

function normalizeInput(value: string | undefined, fallback: string): string {
  return typeof value === "string" && value.length <= MAX_LENGTH ? value : fallback;
}

function sameCell(left: Cell, right: Cell): boolean {
  return left.i === right.i && left.j === right.j;
}
