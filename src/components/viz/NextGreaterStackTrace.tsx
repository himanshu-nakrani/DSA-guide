import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

type StackAction = "ready" | "inspect" | "pop" | "push" | "resolve" | "complete";

export type NextGreaterFrame = {
  action: StackAction;
  index?: number;
  value?: number;
  stack: number[];
  answers: Array<number | null>;
  title: string;
  explanation: string;
};

const DEFAULT_VALUES = [2, 1, 2, 4, 3, 5];

export function buildNextGreaterFrames(values: number[] = DEFAULT_VALUES): NextGreaterFrame[] {
  const safeValues = values.length ? [...values] : [...DEFAULT_VALUES];
  const answers: Array<number | null> = Array(safeValues.length).fill(null);
  const stack: number[] = [];
  const frames: NextGreaterFrame[] = [{
    action: "ready",
    stack: [],
    answers: [...answers],
    title: "Scan left to right",
    explanation: "The stack stores indices whose next greater value has not been found yet. It stays decreasing from bottom to top.",
  }];
  const snapshot = (action: StackAction, index: number | undefined, title: string, explanation: string): NextGreaterFrame => ({
    action,
    index,
    value: index === undefined ? undefined : safeValues[index],
    stack: [...stack],
    answers: [...answers],
    title,
    explanation,
  });

  for (let index = 0; index < safeValues.length; index += 1) {
    const value = safeValues[index];
    frames.push(snapshot("inspect", index, `Inspect index ${index}`, `${value} is the current value. Pop smaller unresolved values before pushing this index.`));
    while (stack.length && value > safeValues[stack.at(-1)!]) {
      const resolvedIndex = stack.pop()!;
      frames.push({
        ...snapshot("pop", index, `Pop index ${resolvedIndex}`, `${value} is greater than ${safeValues[resolvedIndex]}, so it resolves the next-greater answer for index ${resolvedIndex}.`),
        answers: [...answers],
      });
      answers[resolvedIndex] = value;
      frames.push(snapshot("resolve", index, `Resolve index ${resolvedIndex}`, `nextGreater[${resolvedIndex}] = ${value}. The unresolved stack remains decreasing.`));
    }
    stack.push(index);
    frames.push(snapshot("push", index, `Push index ${index}`, `Index ${index} waits for a future value greater than ${value}.`));
  }

  while (stack.length) {
    const unresolved = stack.pop()!;
    answers[unresolved] = -1;
    frames.push(snapshot("resolve", undefined, `Resolve index ${unresolved}`, `No later value exceeds ${safeValues[unresolved]}, so nextGreater[${unresolved}] = -1.`));
  }

  frames.push({
    action: "complete",
    stack: [],
    answers: [...answers],
    title: "Next-greater answers complete",
    explanation: `The monotonic stack produced ${answers.join(", ")}. Every index was pushed and popped at most once.`,
  });
  return frames;
}

export function NextGreaterStackTrace({
  values = DEFAULT_VALUES,
  caption = "Next-greater stack: pop smaller unresolved values",
}: {
  values?: number[];
  caption?: string;
}) {
  const frames = React.useMemo(() => buildNextGreaterFrames(values), [values]);
  const [step, setStep] = React.useState(0);
  const frame = frames[Math.min(step, frames.length - 1)] ?? frames[0];
  const valuesToRender = values.length ? values : DEFAULT_VALUES;

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton ariaLabel="Reset next-greater stack trace" onClick={() => setStep(0)} disabled={step === 0}>reset</VizButton>
        <VizButton ariaLabel="Previous next-greater stack frame" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton ariaLabel="Next next-greater stack frame" onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton ariaLabel="Finish next-greater stack trace" onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Next greater element monotonic stack trace">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="mb-0 max-w-2xl text-sm leading-relaxed text-[color:var(--ink-soft)]">The stack holds indices still waiting for a larger value to appear on their right.</p>
          <span className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse font-mono text-sm" aria-label="Next greater element answers">
            <thead><tr className="border-b text-left text-[0.65rem] uppercase tracking-[0.1em] text-[color:var(--pencil)]" style={{ borderColor: PALETTE.border }}><th className="p-2">index</th><th className="p-2">value</th><th className="p-2">answer</th></tr></thead>
            <tbody>{valuesToRender.map((value, index) => <tr key={index} style={{ background: frame.index === index ? "color-mix(in srgb, var(--ink-ochre) 14%, transparent)" : "transparent" }}><td className="border-b p-2" style={{ borderColor: PALETTE.border }}>{index}</td><td className="border-b p-2 tabular-nums" style={{ borderColor: PALETTE.border }}>{value}</td><td className="border-b p-2 tabular-nums" style={{ borderColor: PALETTE.border, color: frame.answers[index] === -1 ? PALETTE.muted : frame.answers[index] == null ? PALETTE.ink : PALETTE.c1 }}>{frame.answers[index] == null ? "—" : frame.answers[index]}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }} aria-label="Monotonic stack contents">
          <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">unresolved stack · bottom → top</div>
          <div className="flex min-h-12 flex-wrap items-end gap-2">{frame.stack.length ? frame.stack.map((index) => <span key={index} className="border px-3 py-2 font-mono text-sm" style={{ borderColor: PALETTE.c1, color: PALETTE.c1 }}>{index}:{valuesToRender[index]}</span>) : <span className="font-mono text-sm text-[color:var(--pencil)]">empty</span>}</div>
        </div>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.action === "complete" ? PALETTE.c1 : frame.action === "pop" || frame.action === "resolve" ? PALETTE.c3 : PALETTE.primary }} aria-live="polite">
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.action === "complete" ? PALETTE.c1 : frame.action === "pop" || frame.action === "resolve" ? PALETTE.c3 : PALETTE.primary }}>{frame.title}</span>
          {frame.explanation}
        </div>
      </section>
    </VizFrame>
  );
}
