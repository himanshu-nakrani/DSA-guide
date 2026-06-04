"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * TwoPointers: animated converging pointers searching for a pair summing to T.
 */
export function TwoPointers({
  values,
  target = 11,
  caption = "Two pointers on a sorted array",
}: {
  values?: number[];
  target?: number;
  caption?: string;
}) {
  const arr = (values ?? [1, 3, 4, 5, 7, 8, 11, 14]).slice().sort((a, b) => a - b);
  type Frame = { L: number; R: number; sum: number; action: "move-L" | "move-R" | "found" | "miss" };
  const frames = React.useMemo<Frame[]>(() => {
    const out: Frame[] = [];
    let L = 0;
    let R = arr.length - 1;
    while (L < R) {
      const sum = arr[L] + arr[R];
      if (sum === target) {
        out.push({ L, R, sum, action: "found" });
        return out;
      }
      if (sum < target) {
        out.push({ L, R, sum, action: "move-L" });
        L++;
      } else {
        out.push({ L, R, sum, action: "move-R" });
        R--;
      }
    }
    out.push({ L, R, sum: NaN, action: "miss" });
    return out;
  }, [arr, target]);

  const [step, setStep] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const f = frames[step];

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
          <VizButton onClick={() => setStep(0)}>⏮</VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}>
            step
          </VizButton>
          <span className="font-mono text-foreground">
            target = <span className="tabular-nums">{target}</span>
          </span>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex">
          {arr.map((v, i) => {
            const isL = i === f.L;
            const isR = i === f.R;
            const inWindow = i >= f.L && i <= f.R;
            const found = f.action === "found" && (isL || isR);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                  [{i}]
                </div>
                <div
                  className="w-full text-center py-3 font-mono text-base tabular-nums border"
                  style={{
                    background: found ? PALETTE.c1 : isL ? PALETTE.c3 : isR ? PALETTE.c2 : "transparent",
                    color: found || isL || isR ? PALETTE.paper : PALETTE.ink,
                    borderColor: PALETTE.ink,
                    opacity: inWindow ? 1 : 0.4,
                  }}
                >
                  {v}
                </div>
                <div className="h-4 font-mono text-[0.65rem]">
                  {isL && isR ? (
                    <span style={{ color: PALETTE.ink }}>L=R</span>
                  ) : isL ? (
                    <span style={{ color: PALETTE.c3 }}>L</span>
                  ) : isR ? (
                    <span style={{ color: PALETTE.c2 }}>R</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border border-border p-3 font-mono text-[0.78rem]">
          <span className="text-muted-foreground">
            A[{f.L}] + A[{f.R}] ={" "}
          </span>
          <span className="tabular-nums">{arr[f.L]} + {arr[f.R]} = {isNaN(f.sum) ? "—" : f.sum}</span>
          <span className="mx-3 text-muted-foreground">·</span>
          {f.action === "found" && <span style={{ color: PALETTE.c1 }}>= target ⇒ pair found</span>}
          {f.action === "move-L" && (
            <span>
              &lt; target ⇒ <span style={{ color: PALETTE.c3 }}>L++</span> (need larger)
            </span>
          )}
          {f.action === "move-R" && (
            <span>
              &gt; target ⇒ <span style={{ color: PALETTE.c2 }}>R--</span> (need smaller)
            </span>
          )}
          {f.action === "miss" && <span style={{ color: PALETTE.destructive }}>L ≥ R ⇒ no pair</span>}
        </div>
      </div>
    </VizFrame>
  );
}
