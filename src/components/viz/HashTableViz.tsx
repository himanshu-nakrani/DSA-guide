"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE } from "./_chrome";

/**
 * HashTableViz: insert keys into a fixed-size bucket array using a chosen
 * hash function and collision strategy. Shows chaining vs. open addressing.
 */
type Strategy = "chaining" | "linear-probing";

export function HashTableViz({
  size = 7,
  initial,
  strategy: initialStrategy = "chaining",
  caption = "Hash table — collisions and load factor",
}: {
  size?: number;
  initial?: string[];
  strategy?: Strategy;
  caption?: string;
}) {
  const seeds = initial ?? ["apple", "pear", "fig", "kiwi", "grape", "plum"];
  const [keys, setKeys] = React.useState<string[]>(seeds);
  const [strategy, setStrategy] = React.useState<Strategy>(initialStrategy);
  const [input, setInput] = React.useState("");

  const buckets = React.useMemo(() => buildBuckets(keys, size, strategy), [keys, size, strategy]);

  const collisions = buckets.reduce((a, b) => a + Math.max(0, b.length - 1), 0);
  const lf = keys.length / size;

  return (
    <VizFrame
      caption={caption}
      controls={
        <>
          <VizButton onClick={() => setStrategy("chaining")} active={strategy === "chaining"}>
            chaining
          </VizButton>
          <VizButton onClick={() => setStrategy("linear-probing")} active={strategy === "linear-probing"}>
            linear probing
          </VizButton>
          <VizButton onClick={() => setKeys(seeds)} disabled={keys === seeds}>
            reset
          </VizButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          {Array.from({ length: size }).map((_, i) => {
            const bucket = buckets[i];
            const filled = bucket.length > 0;
            return (
              <div key={i} className="flex items-stretch gap-2">
                <div
                  className="w-12 shrink-0 border font-mono text-xs flex items-center justify-center tabular-nums"
                  style={{
                    background: filled ? PALETTE.c1 : "transparent",
                    color: filled ? PALETTE.paper : PALETTE.ink,
                    borderColor: PALETTE.ink,
                  }}
                >
                  {i}
                </div>
                <div
                  className="flex-1 border border-dashed flex items-center gap-2 px-2 py-1"
                  style={{ borderColor: PALETTE.border }}
                >
                  {bucket.length === 0 && (
                    <span className="font-mono text-xs text-muted-foreground italic">empty</span>
                  )}
                  {bucket.map((node, j) => (
                    <React.Fragment key={`${node.key}-${j}`}>
                      <div
                        className="border px-2 py-1 font-mono text-xs"
                        style={{
                          borderColor: node.collided ? PALETTE.c4 : PALETTE.ink,
                          background: node.collided
                            ? "var(--ink-red-wash)"
                            : PALETTE.paper,
                        }}
                        title={`hash("${node.key}") = ${node.hash} → home bucket ${node.home}${
                          node.collided ? `, probed to ${i}` : ""
                        }`}
                      >
                        {node.key}{" "}
                        <span className="text-muted-foreground">·{node.hash}</span>
                      </div>
                      {strategy === "chaining" && j < bucket.length - 1 && (
                        <span className="font-mono text-xs text-muted-foreground">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[0.72rem]">
          <Stat label="m (buckets)" value={`${size}`} />
          <Stat label="n (keys)" value={`${keys.length}`} />
          <Stat label="load factor α" value={`${lf.toFixed(2)}`} />
          <Stat label="collisions" value={`${collisions}`} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = input.trim();
            if (v && !keys.includes(v)) setKeys([...keys, v]);
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="insert key…"
            className="flex-1 border border-border bg-background px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-foreground"
          />
          <VizButton>insert</VizButton>
        </form>
      </div>
    </VizFrame>
  );
}

type Node = { key: string; hash: number; home: number; collided: boolean };

function buildBuckets(keys: string[], size: number, strategy: Strategy): Node[][] {
  const buckets: Node[][] = Array.from({ length: size }, () => []);
  for (const k of keys) {
    const h = hashKey(k);
    const home = h % size;
    if (strategy === "chaining") {
      buckets[home].push({ key: k, hash: h, home, collided: buckets[home].length > 0 });
    } else {
      let idx = home;
      let probes = 0;
      while (buckets[idx].length > 0 && probes < size) {
        idx = (idx + 1) % size;
        probes++;
      }
      buckets[idx].push({ key: k, hash: h, home, collided: idx !== home });
    }
  }
  return buckets;
}

function hashKey(s: string): number {
  // Tiny non-cryptographic hash, stable across renders.
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
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
