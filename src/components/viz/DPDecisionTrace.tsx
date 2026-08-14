"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type Mode = "house-robber" | "kadane";
type Choice = { id: string; label: string; value: number };
type Frame = {
  index: number;
  value: number;
  choices: Choice[];
  answer: number;
  selected: string;
  stateLabel: string;
  stateValue: string;
  explanation: string;
};

const DEFAULT_VALUES: Record<Mode, number[]> = {
  "house-robber": [2, 7, 9, 3, 1],
  kadane: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
};

export function DPDecisionTrace({
  mode: initialMode = "house-robber",
  values,
  caption = "1D DP decision trace: predict the winning recurrence branch",
}: {
  mode?: Mode;
  values?: number[];
  caption?: string;
}) {
  const safeMode: Mode = initialMode === "kadane" ? "kadane" : "house-robber";
  const safeValues = Array.isArray(values) && values.length > 0 && values.length <= 12 && values.every((value) => typeof value === "number" && Number.isFinite(value)) ? values : DEFAULT_VALUES[safeMode];
  const frames = React.useMemo(() => buildDPDecisionFrames(safeMode, safeValues), [safeMode, safeValues]);
  const [step, setStep] = React.useState(0);
  const [choice, setChoice] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const [previousMode, setPreviousMode] = React.useState(safeMode);

  if (previousMode !== safeMode) {
    setPreviousMode(safeMode);
    setStep(0);
    setChoice(null);
    setRevealed(false);
  }

  const frame = frames[step];
  const reset = () => {
    setStep(0);
    setChoice(null);
    setRevealed(false);
  };
  const goTo = (nextStep: number) => {
    setStep(Math.max(0, Math.min(frames.length - 1, nextStep)));
    setChoice(null);
    setRevealed(false);
  };
  const selectedChoice = frame.choices.find((candidate) => candidate.id === choice);
  const isCorrect = selectedChoice?.id === frame.selected;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <span role="group" aria-label="DP decision mode" className="flex items-center gap-2">
            <VizButton active={safeMode === "house-robber"} onClick={() => { setPreviousMode("house-robber"); reset(); }}>robber</VizButton>
            <VizButton active={safeMode === "kadane"} onClick={() => { setPreviousMode("kadane"); reset(); }}>Kadane</VizButton>
          </span>
          <VizButton onClick={reset}>reset</VizButton>
          <VizButton onClick={() => goTo(step - 1)} disabled={step === 0}>← prev</VizButton>
          <VizButton onClick={() => goTo(step + 1)} disabled={step === frames.length - 1}>next →</VizButton>
        </>
      }
    >
      <section className="space-y-4" aria-label="One-dimensional dynamic programming decision trace">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Predict the branch</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">At index {frame.index}, decide which candidate the recurrence should keep before revealing the answer.</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">index {frame.index + 1}/{frames.length}</div>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Input values">
          {safeValues.map((value, index) => (
            <div key={`${index}-${value}`} className="min-w-10 border px-2 py-2 text-center font-mono text-sm tabular-nums" style={{ borderColor: index === frame.index ? PALETTE.c3 : PALETTE.border, background: index === frame.index ? "color-mix(in srgb, var(--ink-ochre) 14%, transparent)" : "var(--surface-1)", color: index <= frame.index ? PALETTE.ink : PALETTE.muted }}>
              <div className="text-[0.62rem] text-[color:var(--pencil)]">{index}</div>
              {value}
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--pencil)]">Candidates for {safeMode === "house-robber" ? "best[i]" : "current[i]"}</div>
            <div className="grid gap-2">
              {frame.choices.map((candidate) => {
                const selected = choice === candidate.id;
                const correct = revealed && candidate.id === frame.selected;
                const incorrect = revealed && selected && candidate.id !== frame.selected;
                const borderColor = correct ? PALETTE.c1 : incorrect ? PALETTE.destructive : selected ? PALETTE.c3 : PALETTE.border;
                return (
                  <button key={candidate.id} type="button" onClick={() => { setChoice(candidate.id); setRevealed(false); }} className="flex w-full items-center justify-between gap-3 border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]" style={{ borderColor, background: correct ? "color-mix(in srgb, var(--ink-blue) 11%, transparent)" : incorrect ? "color-mix(in srgb, var(--ink-red) 8%, transparent)" : selected ? "color-mix(in srgb, var(--ink-ochre) 13%, transparent)" : "var(--surface-1)" }}>
                    <span className="text-sm leading-relaxed text-[color:var(--ink)]">{candidate.label}</span>
                    <span className="font-mono text-sm tabular-nums" style={{ color: correct ? PALETTE.c1 : incorrect ? PALETTE.destructive : PALETTE.ink }}>{candidate.value}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <VizButton onClick={() => setRevealed(true)} disabled={choice === null} active={revealed}>check choice</VizButton>
              <span className="font-mono text-[0.7rem] leading-relaxed text-[color:var(--pencil)]" aria-live="polite">
                {!revealed ? "Choose the branch before reading the explanation." : isCorrect ? "Correct. The state keeps the better legal choice." : "Not quite. Compare the candidate value with the recurrence shown at right."}
              </span>
            </div>
          </div>

          <div className="border p-3 md:min-w-56" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Rolling state</div>
            <p className="m-0 font-mono text-sm leading-relaxed text-[color:var(--ink)]">{frame.stateLabel}</p>
            <p className="mt-2 mb-0 font-mono text-sm tabular-nums leading-relaxed text-[color:var(--ink-soft)]">{frame.stateValue}</p>
            <div className="mt-3 border-t pt-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: PALETTE.border }}>
              <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--ink-blue)]">recurrence</span>
              {safeMode === "house-robber" ? "max(skip current, best two steps back + current value)" : "max(restart at current value, extend previous run + current value)"}
            </div>
          </div>
        </div>

        {revealed && (
          <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: isCorrect ? PALETTE.c1 : PALETTE.destructive }}>
            <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: isCorrect ? PALETTE.c1 : PALETTE.destructive }}>{isCorrect ? "Why" : "Hint"}</span>
            {frame.explanation}
          </div>
        )}
      </section>
    </VizFrame>
  );
}

export function buildDPDecisionFrames(mode: Mode, values: number[]): Frame[] {
  if (mode === "kadane") return buildKadaneFrames(values);
  return buildRobberFrames(values);
}

function buildRobberFrames(values: number[]): Frame[] {
  let prev2 = 0;
  let prev1 = 0;
  return values.map((value, index) => {
    const skip = prev1;
    const include = (index >= 2 ? prev2 : 0) + value;
    const answer = Math.max(skip, include);
    const selected = include > skip ? "include" : "skip";
    const frame: Frame = {
      index,
      value,
      choices: [
        { id: "skip", label: `skip ${value}`, value: skip },
        { id: "include", label: `include ${value}`, value: include },
      ],
      answer,
      selected,
      stateLabel: "best two rolling values",
      stateValue: `before: ${prev2}, ${prev1} → after: ${prev1}, ${answer}`,
      explanation: selected === "include" ? `Including ${value} adds it to the best state two positions back; taking it blocks only the immediately previous item.` : `Skipping ${value} preserves the best answer already achieved at the previous position, which is at least as good as including it.`,
    };
    prev2 = prev1;
    prev1 = answer;
    return frame;
  });
}

function buildKadaneFrames(values: number[]): Frame[] {
  let current = 0;
  let best = -Infinity;
  return values.map((value, index) => {
    const restart = value;
    const extend = index === 0 ? value : current + value;
    current = Math.max(restart, extend);
    best = Math.max(best, current);
    const selected = extend >= restart ? "extend" : "restart";
    const frame: Frame = {
      index,
      value,
      choices: [
        { id: "restart", label: `restart at ${value}`, value: restart },
        { id: "extend", label: `extend previous run + ${value}`, value: extend },
      ],
      answer: current,
      selected,
      stateLabel: "best run ending here / global best",
      stateValue: `ending: ${current}, global: ${best}`,
      explanation: selected === "extend" ? `The previous run plus ${value} is better than starting over, so the current subarray stays connected.` : `Starting at ${value} is better than carrying the previous run, so the best subarray ending here restarts at this index.`,
    };
    return frame;
  });
}
