"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * DPGrid: fills a 2D DP table step by step. Defaults to LCS but accepts
 * a custom recurrence via `problem`.
 */
type Problem = "lcs" | "edit-distance" | "knapsack";

export function DPGrid({
  problem = "lcs",
  a = "GTCG",
  b = "CTAGC",
  weights,
  values,
  capacity = 7,
  caption,
}: {
  problem?: Problem;
  a?: string;
  b?: string;
  weights?: number[];
  values?: number[];
  capacity?: number;
  caption?: string;
}) {
  const { rows, cols, grid, frames, rowLabels, colLabels, title, recurrence } = React.useMemo(() => {
    if (problem === "knapsack") {
      const w = weights ?? [2, 3, 4, 5];
      const val = values ?? [3, 4, 5, 6];
      return buildKnapsack(w, val, capacity);
    }
    if (problem === "edit-distance") {
      return buildEditDistance(a, b);
    }
    return buildLCS(a, b);
  }, [problem, a, b, weights, values, capacity]);

  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  useTicker(playing, 220, () => {
    setStep((s) => {
      if (s >= frames.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  });

  const f = frames[step];

  return (
    <VizFrame
      caption={caption ?? title}
      controls={
        <>
          <VizButton onClick={() => setStep(0)}>⏮</VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}>
            step
          </VizButton>
          <VizButton onClick={() => setStep(frames.length - 1)}>⏭ done</VizButton>
        </>
      }
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div className="overflow-x-auto">
          <table className="border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="w-9 h-9"></th>
                {colLabels.map((c, j) => (
                  <th
                    key={j}
                    className="w-9 h-9 font-medium text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground border-b border-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  <th className="w-9 h-9 font-medium text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground border-r border-foreground text-right pr-1">
                    {rowLabels[i]}
                  </th>
                  {Array.from({ length: cols }).map((_, j) => {
                    const filled = step >= f.filledIdx[i * cols + j];
                    const isCurrent = f.r === i && f.c === j;
                    return (
                      <td
                        key={j}
                        className="w-9 h-9 text-center tabular-nums border border-border"
                        style={{
                          background: isCurrent
                            ? PALETTE.c3
                            : filled
                              ? `oklch(0.42 0.08 145 / 0.12)`
                              : "transparent",
                          color: isCurrent ? PALETTE.paper : PALETTE.ink,
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                      >
                        {filled ? grid[i][j] : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-border bg-background/60 p-3 font-mono text-[0.78rem] leading-relaxed min-w-64">
          <div className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground mb-2">
            recurrence
          </div>
          <pre className="whitespace-pre-wrap !bg-transparent !text-inherit !p-0 !m-0">{recurrence}</pre>
          <div className="mt-3 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            step
          </div>
          <div>
            cell ({f.r}, {f.c}) = <span className="tabular-nums">{f.value}</span>
          </div>
          <div className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            answer
          </div>
          <div className="tabular-nums">
            {step === frames.length - 1 ? grid[rows - 1][cols - 1] : "—"}
          </div>
        </div>
      </div>
    </VizFrame>
  );
}

type Frame = { r: number; c: number; value: number; filledIdx: number[] };

function buildLCS(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const frames: Frame[] = [];
  const filledIdx = Array(rows * cols).fill(Infinity);
  let stepNo = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let v: number;
      if (i === 0 || j === 0) v = 0;
      else if (a[i - 1] === b[j - 1]) v = grid[i - 1][j - 1] + 1;
      else v = Math.max(grid[i - 1][j], grid[i][j - 1]);
      grid[i][j] = v;
      filledIdx[i * cols + j] = stepNo;
      frames.push({ r: i, c: j, value: v, filledIdx: filledIdx.slice() });
      stepNo++;
    }
  }
  return {
    rows,
    cols,
    grid,
    frames,
    rowLabels: ["∅", ...a.split("")],
    colLabels: ["∅", ...b.split("")],
    title: `LCS DP table — a="${a}", b="${b}"`,
    recurrence:
      "dp[i][j] =\n  0                          if i=0 or j=0\n  dp[i-1][j-1] + 1            if a[i-1] = b[j-1]\n  max(dp[i-1][j], dp[i][j-1]) otherwise",
  };
}

function buildEditDistance(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const frames: Frame[] = [];
  const filledIdx = Array(rows * cols).fill(Infinity);
  let stepNo = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let v: number;
      if (i === 0) v = j;
      else if (j === 0) v = i;
      else if (a[i - 1] === b[j - 1]) v = grid[i - 1][j - 1];
      else v = 1 + Math.min(grid[i - 1][j - 1], grid[i - 1][j], grid[i][j - 1]);
      grid[i][j] = v;
      filledIdx[i * cols + j] = stepNo;
      frames.push({ r: i, c: j, value: v, filledIdx: filledIdx.slice() });
      stepNo++;
    }
  }
  return {
    rows,
    cols,
    grid,
    frames,
    rowLabels: ["∅", ...a.split("")],
    colLabels: ["∅", ...b.split("")],
    title: `Edit distance DP — a="${a}", b="${b}"`,
    recurrence:
      "dp[i][j] =\n  j                                       if i=0\n  i                                       if j=0\n  dp[i-1][j-1]                            if a[i-1] = b[j-1]\n  1 + min(replace, delete, insert)        otherwise",
  };
}

function buildKnapsack(w: number[], val: number[], C: number) {
  const n = w.length;
  const rows = n + 1;
  const cols = C + 1;
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const frames: Frame[] = [];
  const filledIdx = Array(rows * cols).fill(Infinity);
  let stepNo = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let v: number;
      if (i === 0 || j === 0) v = 0;
      else if (w[i - 1] > j) v = grid[i - 1][j];
      else v = Math.max(grid[i - 1][j], grid[i - 1][j - w[i - 1]] + val[i - 1]);
      grid[i][j] = v;
      filledIdx[i * cols + j] = stepNo;
      frames.push({ r: i, c: j, value: v, filledIdx: filledIdx.slice() });
      stepNo++;
    }
  }
  return {
    rows,
    cols,
    grid,
    frames,
    rowLabels: ["∅", ...w.map((wi, i) => `${val[i]}/${wi}`)],
    colLabels: Array.from({ length: cols }, (_, j) => `${j}`),
    title: `0/1 Knapsack DP — C=${C}`,
    recurrence:
      "dp[i][j] =\n  0                                              if i=0 or j=0\n  dp[i-1][j]                                     if w[i-1] > j\n  max(dp[i-1][j], dp[i-1][j-w[i-1]] + v[i-1])    otherwise",
  };
}
