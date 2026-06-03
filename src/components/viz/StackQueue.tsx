"use client";

import * as React from "react";
import { VizFrame, VizButton, PALETTE } from "./_chrome";

/**
 * StackQueue: side-by-side LIFO and FIFO visualizers with push/pop animations.
 */
export function StackQueue({
  mode = "stack",
  initial,
  caption,
}: {
  mode?: "stack" | "queue" | "both";
  initial?: (string | number)[];
  caption?: string;
}) {
  const seeds = React.useMemo(
    () => (initial ?? ["A", "B", "C", "D"]).map(String),
    [initial],
  );
  const [items, setItems] = React.useState<string[]>(seeds);
  const [next, setNext] = React.useState<string>("E");
  const [lastOp, setLastOp] = React.useState<string>("init");

  if (mode === "both") {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <StackQueue mode="stack" initial={initial} caption="Stack — LIFO" />
        <StackQueue mode="queue" initial={initial} caption="Queue — FIFO" />
      </div>
    );
  }

  const push = () => {
    setItems((xs) => [...xs, next]);
    setLastOp(`push(${next})`);
    setNext((c) => String.fromCharCode(((c.charCodeAt(0) + 1 - 65) % 26) + 65));
  };
  const pop = () => {
    if (items.length === 0) return;
    if (mode === "stack") {
      const x = items[items.length - 1];
      setItems(items.slice(0, -1));
      setLastOp(`pop() → ${x}`);
    } else {
      const x = items[0];
      setItems(items.slice(1));
      setLastOp(`dequeue() → ${x}`);
    }
  };
  const reset = () => {
    setItems(seeds);
    setNext("E");
    setLastOp("reset");
  };

  return (
    <VizFrame
      caption={caption ?? (mode === "stack" ? "Stack — LIFO" : "Queue — FIFO")}
      controls={
        <>
          <VizButton onClick={push}>{mode === "stack" ? "push" : "enqueue"}</VizButton>
          <VizButton onClick={pop} disabled={items.length === 0}>
            {mode === "stack" ? "pop" : "dequeue"}
          </VizButton>
          <VizButton onClick={reset}>reset</VizButton>
        </>
      }
    >
      {mode === "stack" ? (
        <div className="flex justify-center items-end gap-4 min-h-[180px]">
          <div className="flex flex-col-reverse border-x-2 border-b-2 border-foreground min-w-32">
            {items.length === 0 && (
              <div className="font-mono text-xs text-muted-foreground italic py-6 text-center">
                empty
              </div>
            )}
            {items.map((v, i) => (
              <div
                key={i}
                className="w-32 border-t border-foreground px-3 py-2 text-center font-mono"
                style={{
                  background: i === items.length - 1 ? PALETTE.c1 : "transparent",
                  color: i === items.length - 1 ? PALETTE.paper : PALETTE.ink,
                }}
              >
                {v}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs">
            {items.length > 0 && (
              <div style={{ color: PALETTE.c1 }}>← top</div>
            )}
            <div className="text-muted-foreground">size: {items.length}</div>
            <div className="text-muted-foreground">last: {lastOp}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              FRONT
            </div>
            <div className="flex-1 flex border border-foreground min-h-12">
              {items.length === 0 && (
                <div className="flex-1 font-mono text-xs text-muted-foreground italic flex items-center justify-center">
                  empty
                </div>
              )}
              {items.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-foreground last:border-r-0 px-3 py-3 text-center font-mono"
                  style={{
                    background: i === 0 ? PALETTE.c1 : i === items.length - 1 ? PALETTE.c3 : "transparent",
                    color: i === 0 || i === items.length - 1 ? PALETTE.paper : PALETTE.ink,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              BACK
            </div>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            size: {items.length} · last: {lastOp}
          </div>
        </div>
      )}
    </VizFrame>
  );
}
