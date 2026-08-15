import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type Update = "left" | "right" | "found" | "miss";

export type BinaryInvariantFrame = {
  lo: number;
  hi: number;
  mid: number;
  value?: number;
  update: Update;
  title: string;
  explanation: string;
};

const DEFAULT_VALUES = [2, 4, 7, 9, 12, 17, 23, 31, 42];

export function buildBinaryInvariantFrames(values: number[] = DEFAULT_VALUES, target = 23): BinaryInvariantFrame[] {
  const arr = [...values].sort((a, b) => a - b);
  const frames: BinaryInvariantFrame[] = [];
  let lo = 0;
  let hi = arr.length;
  frames.push({ lo, hi, mid: -1, update: "left", title: "Start with [lo, hi)", explanation: `The target is guaranteed to be in the half-open interval [${lo}, ${hi}) if it exists.` });

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) {
      frames.push({ lo, hi, mid, value: arr[mid], update: "found", title: `Found ${target} at index ${mid}`, explanation: `A[mid] equals the target, so the invariant identifies the answer without changing the interval.` });
      return frames;
    }
    if (arr[mid] < target) {
      frames.push({ lo, hi, mid, value: arr[mid], update: "right", title: `Move lo to ${mid + 1}`, explanation: `${arr[mid]} is smaller than ${target}; indices through mid are impossible, so the next interval is [${mid + 1}, ${hi}).` });
      lo = mid + 1;
    } else {
      frames.push({ lo, hi, mid, value: arr[mid], update: "left", title: `Move hi to ${mid}`, explanation: `${arr[mid]} is larger than ${target}; mid remains excluded from the next interval, so the next interval is [${lo}, ${mid}).` });
      hi = mid;
    }
  }

  frames.push({ lo, hi, mid: -1, update: "miss", title: "Interval is empty", explanation: `lo equals hi at ${lo}; the target is not present while the invariant remains valid.` });
  return frames;
}

export function BinarySearchInvariantTrace({
  values = DEFAULT_VALUES,
  target = 23,
  caption = "Binary-search invariant: maintain the half-open window",
}: {
  values?: number[];
  target?: number;
  caption?: string;
}) {
  const frames = React.useMemo(() => buildBinaryInvariantFrames(values, target), [values, target]);
  const [step, setStep] = React.useState(0);
  const frame = frames[Math.min(step, frames.length - 1)] ?? frames[0];
  const sorted = [...values].sort((a, b) => a - b);

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton ariaLabel="Reset binary-search invariant trace" onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
        <VizButton ariaLabel="Previous binary-search invariant frame" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton ariaLabel="Next binary-search invariant frame" onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton ariaLabel="Finish binary-search invariant trace" onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Binary search invariant trace">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="mb-0 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">The live candidate set is always the half-open interval [lo, hi). Never mix inclusive and half-open updates.</p>
          <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</span>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-[30rem] border-y py-3" aria-label="Sorted binary-search array">
            {sorted.map((value, index) => {
              const active = index >= frame.lo && index < frame.hi;
              const midpoint = index === frame.mid;
              const found = midpoint && frame.update === "found";
              return <div key={`${value}-${index}`} className="flex min-w-12 flex-1 flex-col items-center gap-1 font-mono text-sm"><span className="text-[0.6rem] text-[color:var(--pencil)]">[{index}]</span><span className="w-full border px-2 py-3 text-center tabular-nums" style={{ borderColor: midpoint ? PALETTE.c3 : PALETTE.border, background: found ? PALETTE.c1 : midpoint ? "color-mix(in srgb, var(--ink-ochre) 18%, transparent)" : active ? "transparent" : "color-mix(in srgb, var(--pencil) 10%, transparent)", color: found ? PALETTE.paper : active ? PALETTE.ink : PALETTE.muted }}>{value}</span><span className="h-4 text-[0.62rem] uppercase" style={{ color: midpoint ? PALETTE.c3 : active ? PALETTE.primary : PALETTE.muted }}>{index === frame.lo ? "lo" : index === frame.hi - 1 ? "hi−1" : midpoint ? "mid" : ""}</span></div>;
            })}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
          <div className="border p-2" style={{ borderColor: PALETTE.border }}><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">lo</dt><dd className="mt-1 tabular-nums">{frame.lo}</dd></div>
          <div className="border p-2" style={{ borderColor: PALETTE.border }}><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">hi</dt><dd className="mt-1 tabular-nums">{frame.hi}</dd></div>
          <div className="border p-2" style={{ borderColor: PALETTE.border }}><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">mid</dt><dd className="mt-1 tabular-nums">{frame.mid < 0 ? "—" : frame.mid}</dd></div>
          <div className="border p-2" style={{ borderColor: PALETTE.border }}><dt className="text-[0.62rem] uppercase text-[color:var(--pencil)]">target</dt><dd className="mt-1 tabular-nums">{target}</dd></div>
        </dl>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.update === "found" ? PALETTE.c1 : frame.update === "miss" ? PALETTE.destructive : PALETTE.c3 }} aria-live="polite">
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.update === "found" ? PALETTE.c1 : frame.update === "miss" ? PALETTE.destructive : PALETTE.c3 }}>{frame.title}</span>
          {frame.explanation}
        </div>
      </section>
    </VizFrame>
  );
}
