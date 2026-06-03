"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * ArrayMemory: shows how a contiguous array sits in linear address space.
 * Hovering an index highlights the address arithmetic: base + i × stride.
 */
export function ArrayMemory({
  values,
  base = 0x1000,
  stride = 4,
  caption = "Contiguous layout: address = base + i × element_size",
}: {
  values?: (number | string)[];
  base?: number;
  stride?: number;
  caption?: string;
}) {
  const items = values ?? [17, 42, 8, 23, 4, 99, 5, 31];
  const [hover, setHover] = React.useState<number | null>(null);

  const addr = (i: number) => base + i * stride;

  return (
    <VizFrame
      caption={caption}
      controls={
        <span className="font-mono text-foreground">
          {hover != null ? (
            <>
              <span className="opacity-60">A[{hover}] @ </span>
              <span className="tabular-nums">0x{addr(hover).toString(16).toUpperCase()}</span>
            </>
          ) : (
            <span className="opacity-60">hover an index</span>
          )}
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {/* index labels */}
        <div className="flex">
          {items.map((_, i) => (
            <div
              key={i}
              className="flex-1 text-center font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground"
            >
              [{i}]
            </div>
          ))}
        </div>
        {/* memory cells */}
        <div className="flex border border-foreground">
          {items.map((v, i) => {
            const on = hover === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="flex-1 border-r border-foreground last:border-r-0 py-3 text-center font-mono text-base transition-colors cursor-default tabular-nums"
                style={{
                  background: on ? PALETTE.c1 : "transparent",
                  color: on ? PALETTE.paper : PALETTE.ink,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
        {/* memory addresses */}
        <div className="flex">
          {items.map((_, i) => (
            <div
              key={i}
              className="flex-1 text-center font-mono text-[0.62rem] tabular-nums text-muted-foreground"
              style={{ color: hover === i ? PALETTE.c1 : undefined }}
            >
              0x{addr(i).toString(16).toUpperCase()}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[0.72rem]">
          <Stat label="base" value={`0x${base.toString(16).toUpperCase()}`} />
          <Stat label="element size" value={`${stride} bytes`} />
          <Stat
            label="formula"
            value={
              hover != null
                ? `${base.toString(16).toUpperCase()} + ${hover}·${stride} = 0x${addr(hover)
                    .toString(16)
                    .toUpperCase()}`
                : "base + i · size"
            }
          />
        </div>
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
