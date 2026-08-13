"use client";

import * as React from "react";
import { VizButton, VizFrame, PALETTE } from "./_chrome";

type Choice = {
  label: string;
  explanation?: string;
};

export function KnowledgeCheck({
  question,
  choices,
  answer,
  caption = "Knowledge check — retrieve the idea before reading the explanation",
}: {
  question?: string;
  choices?: Choice[];
  answer?: number;
  caption?: string;
}) {
  const safeChoices = (choices ?? []).filter(
    (choice): choice is Choice => Boolean(choice && typeof choice.label === "string" && choice.label.trim()),
  );
  const safeAnswer = typeof answer === "number" && answer >= 0 && answer < safeChoices.length ? answer : 0;
  const [selected, setSelected] = React.useState<number | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  if (!question || safeChoices.length < 2) {
    return (
      <VizFrame caption="Knowledge check unavailable">
        <p className="m-0 text-sm text-muted-foreground">This checkpoint needs a question and at least two choices.</p>
      </VizFrame>
    );
  }

  const isCorrect = selected === safeAnswer;
  const feedback = selected === null
    ? "Choose the statement you would rely on while implementing or proving the algorithm."
    : isCorrect
      ? "Correct. Keep the reason, not just the wording: it is the constraint that makes the next step safe."
      : "Not quite. Compare each option against the exact boundary, state, or monotonic property in the surrounding example.";

  return (
    <VizFrame
      caption={caption}
      controls={
        <VizButton
          onClick={() => {
            setSelected(null);
            setRevealed(false);
          }}
          disabled={selected === null && !revealed}
        >
          reset
        </VizButton>
      }
    >
      <fieldset className="space-y-4">
        <legend className="font-serif text-[1.02rem] leading-relaxed text-[color:var(--ink)]">{question}</legend>
        <div className="grid gap-2" role="radiogroup" aria-label={question}>
          {safeChoices.map((choice, index) => {
            const isSelected = selected === index;
            const revealCorrect = revealed && index === safeAnswer;
            const revealIncorrect = revealed && isSelected && index !== safeAnswer;
            const borderColor = revealCorrect
              ? PALETTE.c1
              : revealIncorrect
                ? PALETTE.destructive
                : isSelected
                  ? PALETTE.c3
                  : PALETTE.border;
            const background = revealCorrect
              ? "color-mix(in srgb, var(--ink-blue) 11%, transparent)"
              : revealIncorrect
                ? "color-mix(in srgb, var(--ink-red) 9%, transparent)"
                : isSelected
                  ? "color-mix(in srgb, var(--ink-ochre) 13%, transparent)"
                  : "var(--surface-1)";
            return (
              <label
                key={`${choice.label}-${index}`}
                className="flex cursor-pointer items-start gap-3 border px-3 py-3 transition-colors focus-within:ring-2 focus-within:ring-[color:var(--ink-blue)]"
                style={{ borderColor, background }}
              >
                <input
                  type="radio"
                  name={`knowledge-check-${question}`}
                  value={index}
                  checked={isSelected}
                  onChange={() => {
                    setSelected(index);
                    setRevealed(false);
                  }}
                  className="mt-1 accent-[color:var(--ink-blue)]"
                />
                <span className="text-sm leading-relaxed text-[color:var(--ink)]">{choice.label}</span>
              </label>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setRevealed(true)} disabled={selected === null} active={revealed}>
            check answer
          </VizButton>
          <span aria-live="polite" className="font-mono text-[0.7rem] leading-relaxed text-[color:var(--pencil)]">
            {revealed ? feedback : "Select an answer, then check your reasoning."}
          </span>
        </div>
        {revealed && selected !== null && safeChoices[safeAnswer]?.explanation && (
          <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: PALETTE.c1 }}>
            <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--ink-blue)]">Why</span>
            {safeChoices[safeAnswer].explanation}
          </div>
        )}
      </fieldset>
    </VizFrame>
  );
}
