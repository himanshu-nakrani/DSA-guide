"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type RollingDirection = "backward" | "forward";
export type RollingBufferFrame = {
  step: number;
  direction: RollingDirection;
  itemIndex: number | null;
  capacity: number | null;
  dp: number[];
  candidate: number | null;
  updated: boolean;
  reusesCurrentItem: boolean;
  status: "ready" | "processing" | "complete";
  title: string;
  explanation: string;
};

const WEIGHTS = [2, 3, 4];
const VALUES = [3, 4, 5];
const CAPACITY = 6;

export function buildRollingBufferFrames(direction: RollingDirection = "backward"): RollingBufferFrame[] {
  const frames: RollingBufferFrame[] = [{
    step: 0, direction, itemIndex: null, capacity: null, dp: Array(CAPACITY + 1).fill(0), candidate: null, updated: false, reusesCurrentItem: false, status: "ready",
    title: "Start with an empty buffer", explanation: "The one-dimensional buffer stores the best value for every capacity using the items processed so far. Choose a loop direction, then inspect one item at a time.",
  }];
  let step = 1;
  const dp = Array(CAPACITY + 1).fill(0) as number[];
  for (let itemIndex = 0; itemIndex < WEIGHTS.length; itemIndex += 1) {
    const weight = WEIGHTS[itemIndex];
    const value = VALUES[itemIndex];
    const touchedThisItem = new Set<number>();
    const capacities = direction === "backward"
      ? Array.from({ length: CAPACITY - weight + 1 }, (_, index) => CAPACITY - index)
      : Array.from({ length: CAPACITY - weight + 1 }, (_, index) => weight + index);
    for (const capacity of capacities) {
      const before = [...dp];
      const candidate = dp[capacity - weight] + value;
      const reusesCurrentItem = direction === "forward" && touchedThisItem.has(capacity - weight);
      const updated = candidate > dp[capacity];
      if (updated) {
        dp[capacity] = candidate;
        touchedThisItem.add(capacity);
      }
      frames.push({
        step: step++, direction, itemIndex, capacity, dp: [...dp], candidate, updated, reusesCurrentItem, status: "processing",
        title: `${direction === "backward" ? "Back" : "Forward"}ward: item ${itemIndex + 1} at capacity ${capacity}`,
        explanation: direction === "backward"
          ? (updated ? `Take item ${itemIndex + 1} once: ${candidate} beats the previous value ${before[capacity]}. Higher capacities are visited first, so the current item cannot feed another update in this pass.` : `Skipping item ${itemIndex + 1} remains best: ${before[capacity]} is at least ${candidate}.`)
          : (reusesCurrentItem ? `This forward read can use a value written earlier in the same item pass. That is exactly how 0/1 knapsack accidentally becomes unbounded knapsack.` : updated ? `The candidate improves capacity ${capacity}, but forward order leaves lower capacities available for this same item later.` : `No improvement at this capacity; the direction is still unsafe for the 0/1 guarantee.`),
      });
    }
  }
  frames.push({
    step: step++, direction, itemIndex: null, capacity: null, dp: [...dp], candidate: null, updated: false, reusesCurrentItem: direction === "forward", status: "complete",
    title: direction === "backward" ? "One-use guarantee preserved" : "Direction challenge complete",
    explanation: direction === "backward" ? `The final value is ${dp[CAPACITY]}. Descending capacities ensure every item reads the previous item-layer value, so no item is used twice.` : `The forward trace ends at ${dp[CAPACITY]}, but it may have reused an item during the same pass. For 0/1 knapsack, choose backward iteration instead.`,
  });
  return frames;
}

export function RollingBufferTrace({ caption = "Rolling buffer: why 0/1 knapsack iterates capacity backward", direction: initialDirection = "backward" }: { caption?: string; direction?: RollingDirection }) {
  const safeDirection: RollingDirection = initialDirection === "forward" ? "forward" : "backward";
  const [direction, setDirection] = React.useState<RollingDirection>(safeDirection);
  const [previousInitialDirection, setPreviousInitialDirection] = React.useState(safeDirection);
  const [step, setStep] = React.useState(0);

  if (previousInitialDirection !== safeDirection) {
    setPreviousInitialDirection(safeDirection);
    setDirection(safeDirection);
    setStep(0);
  }

  const frames = React.useMemo(() => buildRollingBufferFrames(direction), [direction]);
  const frame = frames[step];
  const reset = () => setStep(0);
  const switchDirection = (next: RollingDirection) => { setDirection(next); setStep(0); };

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton active={direction === "backward"} onClick={() => switchDirection("backward")}>backward · 0/1</VizButton>
        <VizButton active={direction === "forward"} onClick={() => switchDirection("forward")}>forward · challenge</VizButton>
        <VizButton onClick={reset} disabled={step === 0}>reset</VizButton>
        <VizButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Rolling one-dimensional knapsack buffer trace">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Items: (weight, value) = (2,3), (3,4), (4,5)</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">The buffer is the previous 2D row compressed into one dimension. Direction decides whether a current item can see its own writes.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse font-mono text-sm" aria-label="Rolling buffer capacities">
            <thead><tr><th className="border p-2 text-left font-normal text-[color:var(--pencil)]" style={{ borderColor: PALETTE.border }}>capacity</th>{frame.dp.map((_, capacity) => <th key={capacity} className="border p-2 text-center font-normal" style={{ borderColor: PALETTE.border }}>{capacity}</th>)}</tr></thead>
            <tbody><tr><th className="border p-2 text-left font-normal text-[color:var(--pencil)]" style={{ borderColor: PALETTE.border }}>dp[c]</th>{frame.dp.map((value, capacity) => <td key={capacity} className="border p-2 text-center tabular-nums" style={{ borderColor: frame.capacity === capacity ? PALETTE.c3 : PALETTE.border, background: frame.capacity === capacity ? "color-mix(in srgb, var(--ink-ochre) 15%, transparent)" : "var(--surface-1)" }}>{value}</td>)}</tr></tbody>
          </table>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)] items-start">
          <div className="border p-3" style={{ borderColor: frame.reusesCurrentItem ? PALETTE.destructive : PALETTE.border, background: "var(--surface-2)" }}>
            <div className="mb-2 flex items-center justify-between gap-2"><div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Current transition</div><span className="font-mono text-xs" style={{ color: frame.reusesCurrentItem ? PALETTE.destructive : PALETTE.ink }}>{frame.status}</span></div>
            <div className="font-mono text-sm leading-relaxed text-[color:var(--ink)]">{frame.itemIndex === null ? "dp[c] = 0 for every capacity c" : `item ${frame.itemIndex + 1}: dp[${frame.capacity}] = max(dp[${frame.capacity}], dp[${(frame.capacity ?? 0) - WEIGHTS[frame.itemIndex]}] + ${VALUES[frame.itemIndex]})`}</div>
            {frame.candidate !== null && <div className="mt-2 font-mono text-sm tabular-nums text-[color:var(--ink-soft)]">candidate = {frame.candidate} {frame.updated ? "→ update" : "→ keep"}</div>}
          </div>
          <div className="border p-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.reusesCurrentItem ? PALETTE.destructive : PALETTE.border }} aria-live="polite"><span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.reusesCurrentItem ? PALETTE.destructive : frame.status === "complete" ? PALETTE.c1 : PALETTE.c3 }}>{frame.title}</span>{frame.explanation}</div>
        </div>
      </section>
    </VizFrame>
  );
}
