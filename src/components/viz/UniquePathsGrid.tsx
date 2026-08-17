"use client";

import * as React from "react";
import { PALETTE, VizButton, VizFrame } from "./_chrome";

export type UniquePathsCell = { row: number; col: number };
export type UniquePathsFrame = {
  step: number;
  values: Array<Array<number | null>>;
  current: UniquePathsCell | null;
  status: "ready" | "filled" | "obstacle" | "complete";
  formula: string;
  title: string;
  explanation: string;
  answer: number | null;
};

const ROWS = 4;
const COLS = 5;
const DEFAULT_OBSTACLES = ["1,2", "2,2"];

function keyOf(row: number, col: number): string {
  return `${row},${col}`;
}

export function buildUniquePathsFrames(obstacles: string[] = DEFAULT_OBSTACLES): UniquePathsFrame[] {
  const blocked = new Set(obstacles);
  const values = Array.from({ length: ROWS }, () => Array<number | null>(COLS).fill(null));
  values[0][0] = 1;
  const frames: UniquePathsFrame[] = [{
    step: 0,
    values: cloneGrid(values),
    current: null,
    status: "ready",
    formula: "dp[0][0] = 1",
    title: "Choose the obstacles, then fill",
    explanation: "The start cell has one empty path. Toggle obstacle cells before stepping; an obstacle contributes zero paths and is never entered.",
    answer: null,
  }];

  let step = 1;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (row === 0 && col === 0) continue;
      const current = { row, col };
      if (blocked.has(keyOf(row, col))) {
        values[row][col] = 0;
        frames.push({
          step: step++, values: cloneGrid(values), current, status: "obstacle",
          formula: `dp[${row}][${col}] = 0`, title: `Block (${row}, ${col})`,
          explanation: "An obstacle breaks every path that would enter this cell, so its count is zero regardless of the two neighboring cells.", answer: null,
        });
        continue;
      }
      const fromTop = row > 0 ? values[row - 1][col] ?? 0 : 0;
      const fromLeft = col > 0 ? values[row][col - 1] ?? 0 : 0;
      values[row][col] = fromTop + fromLeft;
      frames.push({
        step: step++, values: cloneGrid(values), current, status: "filled",
        formula: `dp[${row}][${col}] = ${fromTop} + ${fromLeft} = ${values[row][col]}`,
        title: `Fill (${row}, ${col})`,
        explanation: "Every valid path into this cell must arrive from above or from the left. Adding those disjoint choices counts each path exactly once.", answer: null,
      });
    }
  }

  frames.push({
    step: step++, values: cloneGrid(values), current: null, status: "complete",
    formula: `answer = dp[${ROWS - 1}][${COLS - 1}] = ${values[ROWS - 1][COLS - 1] ?? 0}`,
    title: "Read the bottom-right answer",
    explanation: "The bottom-right cell counts all paths that avoid every selected obstacle. The recurrence counted paths, not path cost.",
    answer: values[ROWS - 1][COLS - 1] ?? 0,
  });
  return frames;
}

export function UniquePathsGrid({ caption = "Unique Paths: toggle obstacles and fill the count recurrence" }: { caption?: string }) {
  const [obstacles, setObstacles] = React.useState<string[]>(DEFAULT_OBSTACLES);
  const [step, setStep] = React.useState(0);
  const frames = React.useMemo(() => buildUniquePathsFrames(obstacles), [obstacles]);
  const frame = frames[step];
  const editing = step === 0;

  const reset = () => setStep(0);
  const setPreset = (next: string[]) => { setObstacles(next); setStep(0); };
  const toggleObstacle = (row: number, col: number) => {
    if (!editing || (row === 0 && col === 0) || (row === ROWS - 1 && col === COLS - 1)) return;
    const key = keyOf(row, col);
    setObstacles((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  return (
    <VizFrame caption={caption} controls={
      <>
        <VizButton active={obstacles.join("|") === DEFAULT_OBSTACLES.join("|")} onClick={() => setPreset(DEFAULT_OBSTACLES)}>two obstacles</VizButton>
        <VizButton active={obstacles.length === 0} onClick={() => setPreset([])}>clear obstacles</VizButton>
        <VizButton onClick={reset} disabled={step === 0}>reset</VizButton>
        <VizButton onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← prev</VizButton>
        <VizButton onClick={() => setStep((current) => Math.min(frames.length - 1, current + 1))} disabled={step === frames.length - 1}>next →</VizButton>
        <VizButton onClick={() => setStep(frames.length - 1)} disabled={step === frames.length - 1}>finish</VizButton>
      </>
    }>
      <section className="space-y-4" aria-label="Unique Paths obstacle grid explorer">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Count, do not minimize</div>
            <p className="mt-1 mb-0 font-serif text-[1rem] leading-relaxed text-[color:var(--ink)]">{editing ? "Click cells to toggle obstacles, then step through dp[r][c] = dp[r−1][c] + dp[r][c−1]." : "The grid is locked while the recurrence is running; reset to edit the obstacle pattern."}</p>
          </div>
          <div className="font-mono text-[0.7rem] tabular-nums text-[color:var(--pencil)]">step {step + 1}/{frames.length}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.65fr)] items-start">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-sm" aria-label="Unique paths dynamic programming table">
              <tbody>
                {Array.from({ length: ROWS }, (_, row) => (
                  <tr key={row}>
                    {Array.from({ length: COLS }, (_, col) => {
                      const blocked = obstacles.includes(keyOf(row, col));
                      const value = frame.values[row][col];
                      const active = frame.current?.row === row && frame.current.col === col;
                      const isStart = row === 0 && col === 0;
                      const isEnd = row === ROWS - 1 && col === COLS - 1;
                      return <td key={col} className="p-1">
                        <button type="button" disabled={!editing || isStart || isEnd} onClick={() => toggleObstacle(row, col)} aria-pressed={blocked} aria-label={`Obstacle at row ${row}, column ${col}`} className="relative flex h-12 w-12 min-w-12 flex-col items-center justify-center border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] disabled:cursor-default sm:h-16 sm:w-16 sm:min-w-16" style={{ borderColor: active ? PALETTE.c3 : blocked ? PALETTE.destructive : PALETTE.border, background: blocked ? "color-mix(in srgb, var(--ink-red) 12%, transparent)" : active ? "color-mix(in srgb, var(--ink-ochre) 17%, transparent)" : "var(--surface-1)" }}>
                          <span className="text-[0.6rem] text-[color:var(--pencil)]">({row},{col})</span>
                          <span className="text-base" style={{ color: blocked ? PALETTE.destructive : PALETTE.ink }}>{blocked ? "×" : value === null ? "·" : value}</span>
                          <span className="text-[0.56rem] uppercase tracking-[0.08em]" style={{ color: isStart || isEnd ? PALETTE.primary : blocked ? PALETTE.destructive : PALETTE.muted }}>{isStart ? "start" : isEnd ? "answer" : blocked ? "blocked" : active ? "current" : ""}</span>
                        </button>
                      </td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border p-3" style={{ borderColor: PALETTE.border, background: "var(--surface-2)" }}>
            <div className="mb-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Current recurrence</div>
            <div className="font-mono text-sm leading-relaxed text-[color:var(--ink)]">{frame.formula}</div>
            <div className="mt-3 border-t pt-3" style={{ borderColor: PALETTE.border }}>
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--pencil)]">Answer</div>
              <div className="mt-1 text-2xl tabular-nums text-[color:var(--ink)]">{frame.answer ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="border-l-2 pl-3 text-sm leading-relaxed text-[color:var(--ink-soft)]" style={{ borderColor: frame.status === "obstacle" ? PALETTE.destructive : frame.status === "complete" ? PALETTE.c1 : PALETTE.c3 }} aria-live="polite">
          <span className="mr-1 font-mono text-[0.64rem] uppercase tracking-[0.12em]" style={{ color: frame.status === "obstacle" ? PALETTE.destructive : frame.status === "complete" ? PALETTE.c1 : PALETTE.c3 }}>{frame.title}</span>
          {frame.explanation}
        </div>
      </section>
    </VizFrame>
  );
}

function cloneGrid(values: Array<Array<number | null>>): Array<Array<number | null>> {
  return values.map((row) => [...row]);
}
