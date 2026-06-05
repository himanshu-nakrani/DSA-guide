"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE, useTicker } from "./_chrome";

/**
 * LinearVsBinary: race-style comparison. A single sorted array, two animated
 * pointers — one stepping linearly, one halving. Counter shows ops per side.
 */
export function LinearVsBinary({
  size = 64,
  target,
  caption = "Linear (O(n)) versus binary (O(log n)) search",
}: {
  size?: number;
  target?: number;
  caption?: string;
}) {
  const arr = React.useMemo(() => {
    // Deterministic pseudo-random gaps (mulberry32) so renders stay stable.
    let s = 0x9e3779b9 ^ size;
    const rand = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out: number[] = [];
    let v = 1;
    for (let i = 0; i < size; i++) {
      v += 1 + Math.floor(rand() * 3);
      out.push(v);
    }
    return out;
  }, [size]);

  const tgt = target ?? arr[Math.floor(size * 0.85)];

  type State = {
    linIdx: number;
    linDone: boolean;
    L: number;
    R: number;
    binDone: boolean;
    binFoundAt: number | null;
    linFoundAt: number | null;
    linSteps: number;
    binSteps: number;
  };

  const initial: State = {
    linIdx: 0,
    linDone: false,
    L: 0,
    R: arr.length - 1,
    binDone: false,
    binFoundAt: null,
    linFoundAt: null,
    linSteps: 0,
    binSteps: 0,
  };
  const [s, setS] = React.useState<State>(initial);
  const [playing, setPlaying] = React.useState(false);

  const step = React.useCallback(() => {
    setS((prev) => {
      const next = { ...prev };
      if (!next.linDone) {
        next.linSteps += 1;
        if (arr[next.linIdx] === tgt) {
          next.linFoundAt = next.linIdx;
          next.linDone = true;
        } else if (next.linIdx >= arr.length - 1) {
          next.linDone = true;
        } else {
          next.linIdx += 1;
        }
      }
      if (!next.binDone) {
        if (next.L > next.R) {
          next.binDone = true;
        } else {
          next.binSteps += 1;
          const M = next.L + Math.floor((next.R - next.L) / 2);
          if (arr[M] === tgt) {
            next.binFoundAt = M;
            next.binDone = true;
          } else if (arr[M] < tgt) {
            next.L = M + 1;
          } else {
            next.R = M - 1;
          }
        }
      }
      if (next.linDone && next.binDone) setPlaying(false);
      return next;
    });
  }, [arr, tgt]);

  useTicker(playing, 220, step);

  const W = 640;
  const H = 220;
  const PAD = { l: 20, r: 20, t: 40, b: 40 };
  const plotW = W - PAD.l - PAD.r;
  const cellW = plotW / arr.length;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setS(initial)} disabled={s.linSteps === 0 && s.binSteps === 0}>
            ⏮ reset
          </VizButton>
          <VizButton onClick={() => setPlaying((p) => !p)} active={playing}>
            {playing ? "pause" : "play"}
          </VizButton>
          <VizButton onClick={step} disabled={s.linDone && s.binDone}>
            step
          </VizButton>
          <span className="font-mono text-foreground">
            target = <span className="tabular-nums">{tgt}</span>
          </span>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-3 font-mono text-[0.72rem]">
        <div className="border border-border p-2">
          <div className="uppercase tracking-[0.12em] text-[0.62rem]" style={{ color: PALETTE.c3 }}>
            linear search
          </div>
          <div className="flex justify-between mt-1">
            <span>steps: <span className="tabular-nums">{s.linSteps}</span></span>
            <span>
              {s.linDone
                ? s.linFoundAt != null
                  ? `found @ ${s.linFoundAt}`
                  : "not found"
                : "running…"}
            </span>
          </div>
        </div>
        <div className="border border-border p-2">
          <div className="uppercase tracking-[0.12em] text-[0.62rem]" style={{ color: PALETTE.c1 }}>
            binary search
          </div>
          <div className="flex justify-between mt-1">
            <span>steps: <span className="tabular-nums">{s.binSteps}</span></span>
            <span>
              {s.binDone
                ? s.binFoundAt != null
                  ? `found @ ${s.binFoundAt}`
                  : "not found"
                : "running…"}
            </span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={caption}>
        {/* linear lane */}
        <text
          x={PAD.l}
          y={PAD.t - 8}
          fontFamily="ui-monospace, monospace"
          fontSize="9"
          letterSpacing="1.2"
          fill={PALETTE.c3}
        >
          LINEAR
        </text>
        {arr.map((v, i) => {
          const x = PAD.l + i * cellW;
          const scanned = i < s.linIdx || (s.linDone && s.linFoundAt != null && i <= s.linFoundAt);
          const here = i === s.linIdx && !s.linDone;
          const found = s.linFoundAt === i;
          return (
            <rect
              key={`l-${i}`}
              x={x}
              y={PAD.t}
              width={Math.max(1, cellW - 1)}
              height={32}
              fill={found ? PALETTE.c1 : here ? PALETTE.c3 : scanned ? `${PALETTE.c3}` : "transparent"}
              fillOpacity={found ? 1 : here ? 1 : scanned ? 0.18 : 1}
              stroke={PALETTE.border}
            />
          );
        })}

        {/* binary lane */}
        <text
          x={PAD.l}
          y={PAD.t + 78}
          fontFamily="ui-monospace, monospace"
          fontSize="9"
          letterSpacing="1.2"
          fill={PALETTE.c1}
        >
          BINARY
        </text>
        {arr.map((v, i) => {
          const x = PAD.l + i * cellW;
          const inWindow = i >= s.L && i <= s.R && !s.binDone;
          const eliminated = !inWindow;
          const here =
            !s.binDone && i === s.L + Math.floor((s.R - s.L) / 2) && s.L <= s.R;
          const found = s.binFoundAt === i;
          return (
            <rect
              key={`b-${i}`}
              x={x}
              y={PAD.t + 86}
              width={Math.max(1, cellW - 1)}
              height={32}
              fill={
                found
                  ? PALETTE.c1
                  : here
                    ? PALETTE.c3
                    : inWindow
                      ? "transparent"
                      : PALETTE.muted
              }
              fillOpacity={found ? 1 : here ? 1 : inWindow ? 1 : eliminated ? 0.18 : 1}
              stroke={PALETTE.border}
            />
          );
        })}

        {/* index ticks for both */}
        {[0, Math.floor(arr.length / 4), Math.floor(arr.length / 2), Math.floor((3 * arr.length) / 4), arr.length - 1].map(
          (i) => (
            <text
              key={i}
              x={PAD.l + i * cellW + cellW / 2}
              y={H - 6}
              fontFamily="ui-monospace, monospace"
              fontSize="9"
              fill={PALETTE.muted}
              textAnchor="middle"
            >
              {i}
            </text>
          ),
        )}
      </svg>
    </VizFrame>
  );
}
