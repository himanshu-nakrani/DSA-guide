"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * SlidingWindow: animated fixed/variable window over an array, with running
 * sum (or max) displayed and a small line chart of the metric over time.
 */
export function SlidingWindow({
  values,
  k = 3,
  mode = "fixed",
  caption = "Sliding window — running sum across the array",
}: {
  values?: number[];
  k?: number;
  mode?: "fixed" | "variable";
  caption?: string;
}) {
  const DEFAULT_ARR = React.useMemo(() => [4, 2, 7, 1, 5, 6, 3, 8, 2, 4, 9, 1], []);
  const arr = values ?? DEFAULT_ARR;
  type Frame = { L: number; R: number; sum: number };
  const frames = React.useMemo<Frame[]>(() => {
    const out: Frame[] = [];
    if (mode === "fixed") {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
        if (i >= k) sum -= arr[i - k];
        if (i >= k - 1) out.push({ L: i - k + 1, R: i, sum });
      }
    } else {
      // Variable window: longest subarray with sum <= 20 as a demo
      const limit = 20;
      let L = 0;
      let sum = 0;
      for (let R = 0; R < arr.length; R++) {
        sum += arr[R];
        while (sum > limit && L <= R) {
          sum -= arr[L];
          L++;
        }
        out.push({ L, R, sum });
      }
    }
    return out;
  }, [arr, k, mode]);

  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const f = frames[step];
  useTicker(playing, 500, () => {
    setStep((s) => {
      if (s >= frames.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  });

  // Chart of running metric
  const W = 640;
  const H = 110;
  const PAD = { l: 16, r: 16, t: 12, b: 18 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const maxY = Math.max(...frames.map((fr) => fr.sum), 1);

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStep(0)}>⏮</VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}>
            step
          </VizButton>
          <span className="font-mono text-foreground">
            {mode === "fixed" ? `k = ${k}` : "sum ≤ 20"}
          </span>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex">
          {arr.map((v, i) => {
            const inWindow = i >= f.L && i <= f.R;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                  [{i}]
                </div>
                <div
                  className="w-full text-center py-3 font-mono text-base tabular-nums border"
                  style={{
                    background: inWindow ? PALETTE.c1 : "transparent",
                    color: inWindow ? PALETTE.paper : PALETTE.ink,
                    borderColor: PALETTE.ink,
                    opacity: inWindow ? 1 : 0.45,
                  }}
                >
                  {v}
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-3 font-mono text-[0.72rem]">
          <Stat label="window" value={`[${f.L}, ${f.R}]`} />
          <Stat label="size" value={`${f.R - f.L + 1}`} />
          <Stat label="sum" value={`${f.sum}`} />
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke={PALETTE.border} />
          {frames.map((fr, i) => {
            const x = PAD.l + (i / Math.max(1, frames.length - 1)) * plotW;
            const y = PAD.t + plotH - (fr.sum / maxY) * plotH;
            const here = i === step;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={here ? 4 : 2.5}
                fill={here ? PALETTE.c3 : PALETTE.c1}
                fillOpacity={here ? 1 : 0.6}
              />
            );
          })}
          <polyline
            fill="none"
            stroke={PALETTE.c1}
            strokeWidth="1.5"
            points={frames
              .map((fr, i) => {
                const x = PAD.l + (i / Math.max(1, frames.length - 1)) * plotW;
                const y = PAD.t + plotH - (fr.sum / maxY) * plotH;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          <text
            x={W - PAD.r}
            y={PAD.t + 8}
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            textAnchor="end"
            fill={PALETTE.muted}
          >
            running window sum
          </text>
        </svg>
      </div>
    </VizFrame>
  );
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
