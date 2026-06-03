"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * BinarySearchPlayer: step through binary search on a sorted array.
 * Shows L, R, M pointers and the eliminated half in muted ink.
 */
type Frame = { L: number; R: number; M: number; status: "search" | "found" | "miss" };

export function BinarySearchPlayer({
  values,
  target = 23,
  caption = "Binary search trace: halve the live window at each step",
}: {
  values?: number[];
  target?: number;
  caption?: string;
}) {
  const arr = (values ?? [2, 4, 7, 9, 12, 17, 23, 31, 42, 56, 78, 91]).slice().sort((a, b) => a - b);
  const frames = computeFrames(arr, target);
  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const frame = frames[step];

  useTicker(playing, 700, () => {
    setStep((s) => {
      if (s >= frames.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  });

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)} disabled={step === 0}>
            ⏮ reset
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            ← prev
          </VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton
            onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}
            disabled={step >= frames.length - 1}
          >
            next →
          </VizButton>
        </>
      }
    >
      <div className="space-y-4">
        <ArrayRow arr={arr} L={frame.L} R={frame.R} M={frame.M} target={target} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[0.72rem]">
          <Stat label="L" value={frame.L >= 0 ? `${frame.L} (${arr[frame.L]})` : "—"} />
          <Stat label="R" value={frame.R >= 0 ? `${frame.R} (${arr[frame.R]})` : "—"} />
          <Stat label="M" value={frame.M >= 0 ? `${frame.M} (${arr[frame.M]})` : "—"} />
          <Stat label="step" value={`${step + 1} / ${frames.length}`} />
        </div>

        <Trace frames={frames} step={step} arr={arr} target={target} />
      </div>
    </VizFrame>
  );
}

function ArrayRow({
  arr,
  L,
  R,
  M,
  target,
}: {
  arr: number[];
  L: number;
  R: number;
  M: number;
  target: number;
}) {
  return (
    <div>
      <div className="flex">
        {arr.map((v, i) => {
          const inWindow = i >= L && i <= R;
          const isMid = i === M;
          const isFound = isMid && arr[M] === target;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                [{i}]
              </div>
              <div
                className="w-full text-center py-3 font-mono text-base tabular-nums border-l border-foreground last:border-r"
                style={{
                  background: isFound
                    ? PALETTE.c1
                    : isMid
                      ? PALETTE.c3
                      : inWindow
                        ? "transparent"
                        : `oklch(0.21 0.018 60 / 0.05)`,
                  color: isFound || isMid ? PALETTE.paper : inWindow ? PALETTE.ink : PALETTE.muted,
                  borderTop: "1px solid var(--foreground)",
                  borderBottom: "1px solid var(--foreground)",
                  opacity: inWindow ? 1 : 0.45,
                }}
              >
                {v}
              </div>
              <div className="h-4 font-mono text-[0.65rem] tabular-nums">
                {i === L && i === R ? (
                  <span style={{ color: PALETTE.c1 }}>L=R</span>
                ) : i === L ? (
                  <span style={{ color: PALETTE.c1 }}>L</span>
                ) : i === R ? (
                  <span style={{ color: PALETTE.c1 }}>R</span>
                ) : i === M ? (
                  <span style={{ color: PALETTE.c3 }}>M</span>
                ) : (
                  ""
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Trace({
  frames,
  step,
  arr,
  target,
}: {
  frames: Frame[];
  step: number;
  arr: number[];
  target: number;
}) {
  return (
    <div className="border border-border bg-background/60 p-3 font-mono text-[0.72rem] leading-relaxed">
      {frames.slice(0, step + 1).map((f, i) => {
        if (f.status === "found")
          return (
            <div key={i} style={{ color: PALETTE.c1 }}>
              <span className="text-muted-foreground">[{String(i + 1).padStart(2, "0")}] </span>
              A[{f.M}] = {arr[f.M]} = target ⇒ found at index {f.M}
            </div>
          );
        if (f.status === "miss")
          return (
            <div key={i} style={{ color: PALETTE.destructive }}>
              <span className="text-muted-foreground">[{String(i + 1).padStart(2, "0")}] </span>
              L &gt; R ⇒ {target} not in array
            </div>
          );
        const cmp = arr[f.M] < target ? "<" : ">";
        const side = arr[f.M] < target ? "right" : "left";
        return (
          <div key={i}>
            <span className="text-muted-foreground">[{String(i + 1).padStart(2, "0")}] </span>
            L={f.L} R={f.R} → M=⌊({f.L}+{f.R})/2⌋={f.M}; A[{f.M}]={arr[f.M]} {cmp} {target} ⇒ search {side}
          </div>
        );
      })}
    </div>
  );
}

function computeFrames(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  let L = 0;
  let R = arr.length - 1;
  while (L <= R) {
    const M = L + Math.floor((R - L) / 2);
    if (arr[M] === target) {
      frames.push({ L, R, M, status: "found" });
      return frames;
    }
    frames.push({ L, R, M, status: "search" });
    if (arr[M] < target) L = M + 1;
    else R = M - 1;
  }
  frames.push({ L, R, M: -1, status: "miss" });
  return frames;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background/60 px-3 py-2">
      <div className="uppercase tracking-[0.12em] text-[0.62rem] text-muted-foreground">
        {label}
      </div>
      <div className="tabular-nums text-foreground">{value}</div>
    </div>
  );
}
