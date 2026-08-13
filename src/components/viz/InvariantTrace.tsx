"use client";

import * as React from "react";
import { VizButton, VizFrame, PALETTE } from "./_chrome";

type TraceFrame = {
  index: number;
  phase: "inspect" | "advance" | "found" | "complete";
  message: string;
};

export function InvariantTrace({
  values,
  target,
  caption = "Invariant trace: the examined prefix can never contain the target",
}: {
  values?: number[];
  target?: number;
  caption?: string;
}) {
  const array = values?.length ? values : [8, 3, 11, 6, 14, 2];
  const searchTarget = target ?? 14;
  const frames = buildFrames(array, searchTarget);
  const [step, setStep] = React.useState(0);
  const frame = frames[step] ?? frames[0];
  const prefixEnd = frame.phase === "inspect" ? frame.index - 1 : frame.index;
  const complete = frame.phase === "found" || frame.phase === "complete";

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
          <VizButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
          <VizButton onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Loop invariant</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">
              Before checking index <code className="font-mono text-[0.88em]">i</code>, target <code className="font-mono text-[0.88em]">{searchTarget}</code> is not in <code className="font-mono text-[0.88em]">A[0..i)</code>.
            </p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[31rem]">
            {array.map((value, index) => {
              const inspected = index <= prefixEnd;
              const current = frame.phase === "inspect" && index === frame.index;
              const match = frame.phase === "found" && index === frame.index;
              return (
                <div key={`${value}-${index}`} className="flex min-w-14 flex-1 flex-col items-center gap-1">
                  <span className="font-mono text-[0.6rem] text-[color:var(--pencil)]">[{index}]</span>
                  <div
                    className="w-full border-y border-l px-2 py-3 text-center font-mono text-base last:border-r"
                    style={{
                      borderColor: PALETTE.border,
                      background: match
                        ? PALETTE.c1
                        : current
                          ? PALETTE.c3
                          : inspected
                            ? "color-mix(in srgb, var(--ink-blue-soft) 20%, transparent)"
                            : "var(--surface-1)",
                      color: match || current ? PALETTE.paper : PALETTE.ink,
                      opacity: !inspected && !current && !match ? 0.62 : 1,
                    }}
                  >
                    {value}
                  </div>
                  <span className="h-4 font-mono text-[0.58rem] uppercase tracking-[0.08em]" style={{ color: current || match ? PALETTE.c3 : PALETTE.muted }}>
                    {match ? "found" : current ? "i" : inspected ? "checked" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="border p-3 font-mono text-[0.72rem] leading-relaxed" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            <div className="mb-1 uppercase tracking-[0.12em] text-[0.62rem] text-[color:var(--pencil)]">Proof state</div>
            {complete
              ? frame.phase === "found"
                ? `A[${frame.index}] = ${searchTarget}; returning this index is correct.`
                : `i = ${array.length}; the entire array was checked, so returning -1 is correct.`
              : `The blue prefix A[0..${Math.max(0, frame.index)}) contains no ${searchTarget}.`}
          </div>
          <div className="border p-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: PALETTE.border, background: "var(--surface-1)" }} aria-live="polite">
            {frame.message}
          </div>
        </div>
      </div>
    </VizFrame>
  );
}

function buildFrames(values: number[], target: number): TraceFrame[] {
  const frames: TraceFrame[] = [];
  for (let index = 0; index < values.length; index += 1) {
    frames.push({
      index,
      phase: "inspect",
      message: `Inspect A[${index}] = ${values[index]}. The invariant only claims that earlier indices cannot contain ${target}; this index is still a candidate.`,
    });
    if (values[index] === target) {
      frames.push({
        index,
        phase: "found",
        message: `The target is at index ${index}. The invariant explains why no earlier element was skipped, so this return is safe.`,
      });
      return frames;
    }
    frames.push({
      index,
      phase: "advance",
      message: `A[${index}] is not ${target}. After incrementing i, the checked prefix grows by one and the invariant is preserved.`,
    });
  }
  frames.push({
    index: values.length,
    phase: "complete",
    message: "The loop ends only after every index has joined the checked prefix. The invariant now proves that the target is absent.",
  });
  return frames;
}
