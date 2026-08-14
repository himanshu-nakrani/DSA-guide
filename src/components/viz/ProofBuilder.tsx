"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type ProofStep = {
  label: string;
  rationale?: string;
};

export function ProofBuilder({
  question = "Arrange the exchange argument for earliest-finish-time activity selection.",
  steps = DEFAULT_STEPS,
  initialOrder = [2, 0, 4, 1, 3],
  caption = "Proof builder — establish why the greedy choice is safe",
}: {
  question?: string;
  steps?: ProofStep[];
  initialOrder?: number[];
  caption?: string;
}) {
  const safeSteps = normalizeSteps(steps);
  const [order, setOrder] = React.useState(() => normalizeOrder(initialOrder, safeSteps.length));
  const [revealed, setRevealed] = React.useState(false);

  if (safeSteps.length < 2) {
    return (
      <VizFrame caption="Proof builder unavailable">
        <p className="m-0 text-sm text-muted-foreground">This proof builder needs at least two ordered proof steps.</p>
      </VizFrame>
    );
  }

  const isCorrect = order.every((stepIndex, position) => stepIndex === position);
  const move = (position: number, delta: -1 | 1) => {
    setOrder((current) => {
      const nextPosition = position + delta;
      if (nextPosition < 0 || nextPosition >= current.length) return current;
      const next = [...current];
      [next[position], next[nextPosition]] = [next[nextPosition], next[position]];
      return next;
    });
    setRevealed(false);
  };

  const reset = () => {
    setOrder(normalizeOrder(initialOrder, safeSteps.length));
    setRevealed(false);
  };

  return (
    <VizFrame
      caption={caption}
      controls={<VizButton onClick={reset} disabled={!revealed && order.every((value, index) => value === normalizeOrder(initialOrder, safeSteps.length)[index])}>reset</VizButton>}
    >
      <section className="space-y-4" aria-label="Exchange argument proof builder">
        <div className="space-y-1">
          <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Your task</div>
          <p className="m-0 font-serif text-[1.02rem] leading-relaxed text-[color:var(--ink)]">{question}</p>
          <p className="m-0 text-sm leading-relaxed text-[color:var(--ink-soft)]">Move each claim into the order that makes the greedy choice safe, then check the proof.</p>
        </div>

        <ol className="space-y-2" aria-label="Reorderable proof steps">
          {order.map((stepIndex, position) => {
            const step = safeSteps[stepIndex];
            const correctPosition = stepIndex === position;
            const showCorrect = revealed && correctPosition;
            const showWrong = revealed && !correctPosition;
            const borderColor = showCorrect ? PALETTE.c1 : showWrong ? PALETTE.destructive : PALETTE.border;
            const background = showCorrect
              ? "color-mix(in srgb, var(--ink-blue) 11%, transparent)"
              : showWrong
                ? "color-mix(in srgb, var(--ink-red) 8%, transparent)"
                : "var(--surface-1)";
            return (
              <li
                key={`${step.label}-${position}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border px-3 py-3"
                style={{ borderColor, background }}
              >
                <span className="font-mono text-[0.72rem] tabular-nums text-[color:var(--pencil)]" aria-label={`Position ${position + 1}`}>
                  {String(position + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="m-0 text-sm leading-relaxed text-[color:var(--ink)]">{step.label}</p>
                  {revealed && !correctPosition && (
                    <p className="mt-1 mb-0 font-mono text-[0.65rem] leading-relaxed text-[color:var(--ink-red)]">This claim belongs at step {stepIndex + 1}.</p>
                  )}
                </div>
                <div className="flex items-center gap-1" role="group" aria-label={`Move proof step ${position + 1}`}>
                  <VizButton onClick={() => move(position, -1)} disabled={position === 0} title="Move earlier">↑</VizButton>
                  <VizButton onClick={() => move(position, 1)} disabled={position === order.length - 1} title="Move later">↓</VizButton>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setRevealed(true)} active={revealed}>check proof</VizButton>
          <span aria-live="polite" className="font-mono text-[0.7rem] leading-relaxed text-[color:var(--pencil)]">
            {revealed
              ? isCorrect
                ? "Correct. The exchange preserves feasibility before induction reduces the remaining instance."
                : "Revisit the moment when feasibility is justified: the exchange must be constructed before the smaller instance can be invoked."
              : "Order the claims before revealing the proof logic."}
          </span>
        </div>

        {revealed && (
          <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: isCorrect ? PALETTE.c1 : PALETTE.destructive }}>
            <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: isCorrect ? PALETTE.c1 : PALETTE.destructive }}>
              {isCorrect ? "Why it works" : "Proof hint"}
            </span>
            {isCorrect
              ? "An exchange argument first aligns an arbitrary optimal solution with the greedy choice without losing optimality. Only then is the remaining subproblem equivalent, which is what makes induction legitimate."
              : "Locate the swap: first compare greedy's choice to an optimal solution's first choice, then replace it and prove the replacement remains feasible and equally good."}
          </div>
        )}
      </section>
    </VizFrame>
  );
}

const DEFAULT_STEPS: ProofStep[] = [
  { label: "Fix an arbitrary optimal schedule O and let g₁ be the greedy activity with the earliest finish time." },
  { label: "Compare g₁ with O's first activity o₁: f(g₁) ≤ f(o₁)." },
  { label: "Construct O′ by replacing o₁ with g₁." },
  { label: "Show O′ is feasible and has the same number of activities as O." },
  { label: "Solve the equivalent remaining instance after f(g₁) by induction." },
];

function normalizeSteps(steps: ProofStep[]): ProofStep[] {
  return steps.filter((step): step is ProofStep => Boolean(step && typeof step.label === "string" && step.label.trim()));
}

function normalizeOrder(order: number[], length: number): number[] {
  const valid = order.filter((index) => Number.isInteger(index) && index >= 0 && index < length);
  const missing = Array.from({ length }, (_, index) => index).filter((index) => !valid.includes(index));
  const merged = [...valid, ...missing];
  if (merged.every((value, index) => value === index) && merged.length > 1) return [...merged].reverse();
  return merged;
}
