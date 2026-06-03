"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * GrowthTable: tabular companion to ComplexityChart — operation counts at
 * representative input sizes. Highlights the practical limits per class.
 */
export function GrowthTable({
  caption = "Operations to expect at common input sizes",
  ns,
}: {
  caption?: string;
  ns?: number[];
}) {
  const sizes = ns ?? [10, 100, 1_000, 10_000, 100_000, 1_000_000];
  const rows: { label: string; fn: (n: number) => number; feasible: number }[] = [
    { label: "O(1)", fn: () => 1, feasible: Infinity },
    { label: "O(log n)", fn: (n) => Math.log2(n), feasible: Infinity },
    { label: "O(n)", fn: (n) => n, feasible: 1e8 },
    { label: "O(n log n)", fn: (n) => n * Math.log2(n), feasible: 1e7 },
    { label: "O(n²)", fn: (n) => n * n, feasible: 1e8 },
    { label: "O(n³)", fn: (n) => n * n * n, feasible: 1e8 },
    { label: "O(2ⁿ)", fn: (n) => (n <= 60 ? Math.pow(2, n) : Infinity), feasible: 1e8 },
    { label: "O(n!)", fn: (n) => factorial(n), feasible: 1e8 },
  ];

  return (
    <VizFrame caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[0.78rem]">
          <thead>
            <tr className="border-b border-foreground">
              <th className="text-left py-2 pr-4 font-medium tracking-[0.12em] text-[0.65rem] uppercase">
                Class
              </th>
              {sizes.map((n) => (
                <th
                  key={n}
                  className="text-right py-2 px-2 font-medium tracking-[0.12em] text-[0.65rem] uppercase"
                >
                  n = {fmt(n)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border/50">
                <td className="py-2 pr-4">{r.label}</td>
                {sizes.map((n) => {
                  const v = r.fn(n);
                  const feasible = v <= r.feasible;
                  return (
                    <td
                      key={n}
                      className="text-right py-2 px-2 tabular-nums"
                      style={{
                        color: feasible ? PALETTE.ink : PALETTE.destructive,
                        opacity: feasible ? 1 : 0.85,
                      }}
                      title={feasible ? "Feasible within ~1s" : "Beyond ~1s on a single core"}
                    >
                      {fmtOps(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-[0.72rem] text-muted-foreground font-serif italic">
          Rule of thumb: a modern CPU handles ~10⁸ simple operations per second.
          Cells in <span style={{ color: PALETTE.destructive }}>brick</span> exceed that budget at the given n.
        </div>
      </div>
    </VizFrame>
  );
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function fmt(n: number): string {
  if (n >= 1e6) return `${n / 1e6}M`;
  if (n >= 1e3) return `${n / 1e3}K`;
  return `${n}`;
}

function fmtOps(v: number): string {
  if (!isFinite(v)) return "∞";
  if (v < 1) return v.toFixed(2);
  if (v < 1000) return v.toFixed(v < 10 ? 1 : 0);
  if (v < 1e6) return (v / 1e3).toFixed(1) + "K";
  if (v < 1e9) return (v / 1e6).toFixed(1) + "M";
  if (v < 1e12) return (v / 1e9).toFixed(1) + "B";
  if (v < 1e15) return (v / 1e12).toFixed(1) + "T";
  return v.toExponential(1);
}
