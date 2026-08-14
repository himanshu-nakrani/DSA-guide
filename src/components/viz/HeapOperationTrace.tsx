"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type HeapMode = "heapify" | "sift-up" | "sift-down";
type HeapStatus = "ready" | "running" | "complete";

export type HeapFrame = {
  values: number[];
  action: string;
  focus: number | null;
  status: HeapStatus;
  explanation: string;
};

const DEFAULT_VALUES = [7, 3, 5, 1, 9, 2];

export function buildHeapFrames(mode: HeapMode = "heapify", input = DEFAULT_VALUES): HeapFrame[] {
  const frames: HeapFrame[] = [];
  const values = [...input];
  const push = (action: string, focus: number | null, status: HeapStatus, explanation: string) => {
    frames.push({ values: [...values], action, focus, status, explanation });
  };

  if (mode === "sift-up") {
    const item = values.pop();
    push("ready", null, "ready", "Append the new item at the end, then compare it with its parent.");
    if (item !== undefined) {
      values.push(item);
      push("append", values.length - 1, "running", `Inserted ${item} at index ${values.length - 1}; its parent is checked next.`);
      let child = values.length - 1;
      while (child > 0) {
        const parent = Math.floor((child - 1) / 2);
        push("compare", child, "running", `Compare ${values[child]} with parent ${values[parent]}.`);
        if (values[parent] >= values[child]) break;
        [values[parent], values[child]] = [values[child], values[parent]];
        push("swap-up", parent, "running", "The child is larger, so swap it upward to restore max-heap order.");
        child = parent;
      }
    }
  } else {
    push("ready", null, "ready", "A max-heap keeps every parent at least as large as its children.");
    const start = mode === "heapify" ? Math.floor(values.length / 2) - 1 : 0;
    const end = mode === "heapify" ? -1 : 0;
    for (let root = start; root >= end; root -= 1) {
      let parent = root;
      while (true) {
        const left = parent * 2 + 1;
        const right = left + 1;
        let largest = parent;
        if (left < values.length && values[left] > values[largest]) largest = left;
        if (right < values.length && values[right] > values[largest]) largest = right;
        if (largest === parent) {
          if (mode === "sift-down") push("settled", parent, "running", "The parent already dominates its children, so this subtree is settled.");
          break;
        }
        push("compare", parent, "running", `Compare the parent with its larger child at index ${largest}.`);
        [values[parent], values[largest]] = [values[largest], values[parent]];
        push("swap-down", largest, "running", "Swap with the larger child and continue down the affected subtree.");
        parent = largest;
      }
    }
  }

  push("complete", null, "complete", "Every parent now dominates its children; the heap-order invariant holds.");
  return frames;
}

export function HeapOperationTrace({
  caption = "Heap operations: preserve the parent-child invariant",
  mode: initialMode = "heapify",
}: {
  caption?: string;
  mode?: HeapMode;
}) {
  const [mode, setMode] = React.useState<HeapMode>(initialMode);
  const frames = React.useMemo(() => buildHeapFrames(mode), [mode]);
  const [step, setStep] = React.useState(0);
  const frame = frames[step];

  const changeMode = (next: HeapMode) => {
    setMode(next);
    setStep(0);
  };

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          {(["heapify", "sift-up", "sift-down"] as HeapMode[]).map((value) => (
            <VizButton key={value} active={mode === value} onClick={() => changeMode(value)}>
              {value}
            </VizButton>
          ))}
          <VizButton onClick={() => setStep(0)}>reset</VizButton>
          <VizButton disabled={step === 0} onClick={() => setStep((current) => current - 1)}>← prev</VizButton>
          <VizButton disabled={step === frames.length - 1} onClick={() => setStep((current) => current + 1)}>next →</VizButton>
          <VizButton onClick={() => setStep(frames.length - 1)}>finish</VizButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-end gap-2 overflow-x-auto pb-2" aria-label="Heap array">
          {frame.values.map((value, index) => (
            <div
              key={`${index}-${value}`}
              className="min-w-14 border p-2 text-center"
              style={{
                borderColor: frame.focus === index ? PALETTE.primary : PALETTE.border,
                background: frame.focus === index ? "color-mix(in srgb, var(--ink-blue) 10%, transparent)" : undefined,
              }}
            >
              <div className="font-mono text-lg tabular-nums">{value}</div>
              <div className="font-mono text-[0.6rem] text-muted-foreground">index {index}</div>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Heap-order invariant</div>
            <p className="mt-1 font-serif text-sm">{frame.explanation}</p>
          </div>
          <div className="border border-border p-3 font-mono text-xs">
            <div>mode: {mode}</div>
            <div>step: {step + 1}/{frames.length}</div>
            <div>action: {frame.action}</div>
            <div>status: {frame.status}</div>
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground" aria-live="polite">
          Parent of index i is floor((i − 1) / 2); heapify starts at the last internal node.
        </div>
      </div>
    </VizFrame>
  );
}
