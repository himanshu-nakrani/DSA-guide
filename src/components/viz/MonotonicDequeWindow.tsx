"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type DequeFrame = {
  index: number;
  value: number;
  deque: number[];
  outputs: number[];
  action: "ready" | "pop-back" | "push" | "expire-front" | "emit" | "complete";
  activeWindow: [number, number] | null;
  explanation: string;
};

const DEFAULT_VALUES = [1, 3, -1, -3, 5, 3, 6, 7];
const DEFAULT_WINDOW = 3;

export function buildMonotonicDequeFrames(values = DEFAULT_VALUES, windowSize = DEFAULT_WINDOW): DequeFrame[] {
  const frames: DequeFrame[] = [];
  const deque: number[] = [];
  const outputs: number[] = [];
  frames.push({ index: -1, value: 0, deque: [], outputs: [], action: "ready", activeWindow: null, explanation: "The deque stores indices whose values decrease from front to back; the front is the current maximum." });

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (deque.length && deque[0] <= index - windowSize) {
      const expired = deque.shift()!;
      frames.push({ index, value, deque: [...deque], outputs: [...outputs], action: "expire-front", activeWindow: [index - windowSize + 1, index], explanation: `Expire index ${expired} from the front because it left the window.` });
    }
    while (deque.length && values[deque[deque.length - 1]] <= value) {
      const removed = deque.pop()!;
      frames.push({ index, value, deque: [...deque], outputs: [...outputs], action: "pop-back", activeWindow: [Math.max(0, index - windowSize + 1), index], explanation: `Pop index ${removed} from the back: value ${values[removed]} cannot beat the incoming value ${value} while it is newer.` });
    }
    deque.push(index);
    frames.push({ index, value, deque: [...deque], outputs: [...outputs], action: "push", activeWindow: [Math.max(0, index - windowSize + 1), index], explanation: `Push index ${index}. Values in the deque remain decreasing from front to back.` });
    if (index >= windowSize - 1) {
      outputs.push(values[deque[0]]);
      frames.push({ index, value, deque: [...deque], outputs: [...outputs], action: "emit", activeWindow: [index - windowSize + 1, index], explanation: `The front index ${deque[0]} is the maximum for window [${index - windowSize + 1}, ${index}].` });
    }
  }
  frames.push({ index: values.length - 1, value: values[values.length - 1], deque: [...deque], outputs: [...outputs], action: "complete", activeWindow: [values.length - windowSize, values.length - 1], explanation: "Each index entered and left the deque at most once, so the full scan is linear." });
  return frames;
}

export function MonotonicDequeWindow({
  caption = "Monotonic deque: keep the window maximum at the front",
  values = DEFAULT_VALUES,
  windowSize = DEFAULT_WINDOW,
}: {
  caption?: string;
  values?: number[];
  windowSize?: number;
}) {
  const frames = React.useMemo(() => buildMonotonicDequeFrames(values, windowSize), [values, windowSize]);
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
        <div className="flex flex-wrap gap-2" aria-label="Sliding window input">
          {values.map((value, index) => {
            const active = frame.activeWindow && index >= frame.activeWindow[0] && index <= frame.activeWindow[1];
            const inDeque = frame.deque.includes(index);
            return (
              <div
                key={index}
                className="min-w-12 border p-2 text-center"
                style={{
                  borderColor: inDeque ? PALETTE.primary : PALETTE.border,
                  background: active ? "color-mix(in srgb, var(--ink-ochre) 14%, transparent)" : undefined,
                }}
              >
                <div className="font-mono text-lg tabular-nums">{value}</div>
                <div className="font-mono text-[0.6rem] text-muted-foreground">i={index}</div>
              </div>
            );
          })}
        </div>
        <div className="border border-border p-3">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Deque front → back</div>
          <div className="mt-2 flex min-h-10 flex-wrap gap-2" aria-live="polite">
            {frame.deque.length ? frame.deque.map((index) => (
              <span key={index} className="border border-[color:var(--ink-blue)] px-2 py-1 font-mono text-xs">{index}:{values[index]}</span>
            )) : <span className="font-mono text-xs text-muted-foreground">empty</span>}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">Current action</div>
            <p className="mt-1 font-mono text-sm">{frame.action}</p>
            <p className="mt-2 font-serif text-sm">{frame.explanation}</p>
          </div>
          <div className="border border-border p-3 font-mono text-xs">
            <div>window size: {windowSize}</div>
            <div>step: {step + 1}/{frames.length}</div>
            <div>outputs: [{frame.outputs.join(", ")}]</div>
          </div>
        </div>
      </div>
    </VizFrame>
  );
}
