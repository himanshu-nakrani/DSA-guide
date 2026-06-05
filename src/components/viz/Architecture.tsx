"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * Architecture: generic boxes-and-arrows diagram driven by a JSON spec.
 * Nodes have x/y in a 12-column grid; edges describe directed flow.
 * Used for "what's inside a hash table" / "what runs where" diagrams.
 */
type Box = {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
  emphasis?: "primary" | "muted" | "warn" | "default";
};
type Arrow = { from: string; to: string; label?: string; dashed?: boolean };

export function Architecture({
  boxes,
  arrows = [],
  caption = "Architecture",
  cols = 12,
  rows = 4,
  height = 320,
}: {
  boxes?: Box[];
  arrows?: Arrow[];
  caption?: string;
  cols?: number;
  rows?: number;
  height?: number;
}) {
  const items = boxes ?? [];
  const W = 720;
  const H = height;
  const cellW = W / cols;
  const cellH = H / rows;

  // Resolve geometry for each box
  const geom = new Map<string, { x: number; y: number; w: number; h: number }>();
  for (const b of items) {
    const w = (b.colSpan ?? 2) * cellW - 16;
    const h = (b.rowSpan ?? 1) * cellH - 16;
    const x = b.col * cellW + 8;
    const y = b.row * cellH + 8;
    geom.set(b.id, { x, y, w, h });
  }

  return (
    <VizFrame caption={caption}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={caption}>
        <defs>
          <marker
            id="arch-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={PALETTE.ink} />
          </marker>
        </defs>

        {/* arrows below boxes */}
        {arrows.map((a, i) => {
          const A = geom.get(a.from);
          const B = geom.get(a.to);
          if (!A || !B) return null;
          const ax = A.x + A.w / 2;
          const ay = A.y + A.h / 2;
          const bx = B.x + B.w / 2;
          const by = B.y + B.h / 2;
          // Pull endpoints to box edges
          const dx = bx - ax;
          const dy = by - ay;
          const angle = Math.atan2(dy, dx);
          const ex = bx - Math.cos(angle) * (B.w / 2 + 6);
          const ey = by - Math.sin(angle) * (B.h / 2 + 6);
          const sx = ax + Math.cos(angle) * (A.w / 2 + 6);
          const sy = ay + Math.sin(angle) * (A.h / 2 + 6);
          return (
            <g key={i}>
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={PALETTE.ink}
                strokeWidth="1.25"
                strokeDasharray={a.dashed ? "4 3" : undefined}
                markerEnd="url(#arch-arrow)"
              />
              {a.label && (
                <text
                  x={(sx + ex) / 2}
                  y={(sy + ey) / 2 - 6}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10"
                  textAnchor="middle"
                  fill={PALETTE.muted}
                  style={{ paintOrder: "stroke", stroke: PALETTE.paper, strokeWidth: 4 }}
                >
                  {a.label}
                </text>
              )}
            </g>
          );
        })}

        {/* boxes */}
        {items.map((b) => {
          const g = geom.get(b.id)!;
          const e = b.emphasis ?? "default";
          const styles =
            e === "primary"
              ? { fill: PALETTE.c1, stroke: PALETTE.ink, color: PALETTE.paper }
              : e === "warn"
                ? { fill: "var(--ink-red-wash)", stroke: PALETTE.destructive, color: PALETTE.ink }
                : e === "muted"
                  ? { fill: "color-mix(in srgb, var(--pencil) 8%, transparent)", stroke: PALETTE.border, color: PALETTE.muted }
                  : { fill: PALETTE.paper, stroke: PALETTE.ink, color: PALETTE.ink };
          return (
            <g key={b.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                fill={styles.fill}
                stroke={styles.stroke}
                strokeWidth="1.25"
              />
              <text
                x={g.x + g.w / 2}
                y={g.y + g.h / 2 + (b.sub ? -4 : 4)}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="12"
                fontWeight="500"
                fill={styles.color}
              >
                {b.label}
              </text>
              {b.sub && (
                <text
                  x={g.x + g.w / 2}
                  y={g.y + g.h / 2 + 12}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="10"
                  fill={styles.color}
                  opacity="0.75"
                >
                  {b.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </VizFrame>
  );
}
