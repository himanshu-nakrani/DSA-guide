"use client";

import * as React from "react";
import { VizFrame, PALETTE } from "./_chrome";

/**
 * LinkedList: SVG diagram of a singly (or doubly) linked list with explicit
 * pointers. Used to show traversal patterns and node-shape mutations.
 */
export function LinkedList({
  values,
  variant = "singly",
  highlight,
  caption = "Linked list — nodes connected by pointers",
}: {
  values?: (number | string)[];
  variant?: "singly" | "doubly" | "circular";
  highlight?: number;
  caption?: string;
}) {
  const items = values ?? [3, 7, 1, 9, 5];

  const cellW = 86;
  const gap = 28;
  const totalW = items.length * cellW + (items.length - 1) * gap + 80;
  const H = 110;

  return (
    <VizFrame caption={caption}>
      <svg viewBox={`0 0 ${totalW} ${H}`} className="w-full h-auto">
        {/* HEAD label */}
        <text
          x={20}
          y={H / 2 - 4}
          fontFamily="ui-monospace, monospace"
          fontSize="11"
          fill={PALETTE.muted}
        >
          HEAD
        </text>
        <line
          x1={20}
          y1={H / 2}
          x2={56}
          y2={H / 2}
          stroke={PALETTE.ink}
          strokeWidth="1.25"
          markerEnd="url(#arrow)"
        />

        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={PALETTE.ink} />
          </marker>
          <marker
            id="arrow-bw"
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 10 0 L 0 5 L 10 10 z" fill={PALETTE.ink} />
          </marker>
        </defs>

        {items.map((v, i) => {
          const x = 60 + i * (cellW + gap);
          const isLast = i === items.length - 1;
          const hot = highlight === i;
          return (
            <g key={i}>
              {/* data | next box */}
              <rect
                x={x}
                y={H / 2 - 22}
                width={cellW}
                height={44}
                fill={hot ? PALETTE.c1 : PALETTE.paper}
                stroke={PALETTE.ink}
                strokeWidth="1.25"
              />
              <line
                x1={x + cellW * 0.6}
                y1={H / 2 - 22}
                x2={x + cellW * 0.6}
                y2={H / 2 + 22}
                stroke={PALETTE.ink}
              />
              <text
                x={x + cellW * 0.3}
                y={H / 2 + 5}
                fontFamily="ui-monospace, monospace"
                fontSize="14"
                textAnchor="middle"
                fill={hot ? PALETTE.paper : PALETTE.ink}
              >
                {v}
              </text>
              <text
                x={x + cellW * 0.8}
                y={H / 2 + 5}
                fontFamily="ui-monospace, monospace"
                fontSize="10"
                textAnchor="middle"
                fill={hot ? PALETTE.paper : PALETTE.muted}
              >
                {isLast && variant !== "circular" ? "∅" : "•"}
              </text>
              <text
                x={x + cellW / 2}
                y={H / 2 - 28}
                fontFamily="ui-monospace, monospace"
                fontSize="9"
                textAnchor="middle"
                fill={PALETTE.muted}
              >
                node {i}
              </text>
              {/* forward arrow */}
              {(!isLast || variant === "circular") && (
                <line
                  x1={x + cellW}
                  y1={H / 2}
                  x2={
                    isLast
                      ? 60 + 0 * (cellW + gap) - 6
                      : x + cellW + gap - 4
                  }
                  y2={
                    isLast ? H / 2 + 30 : H / 2
                  }
                  stroke={PALETTE.ink}
                  strokeWidth="1.25"
                  markerEnd="url(#arrow)"
                />
              )}
              {/* backward arrow for doubly */}
              {variant === "doubly" && i > 0 && (
                <line
                  x1={x}
                  y1={H / 2 + 6}
                  x2={x - gap + 4}
                  y2={H / 2 + 6}
                  stroke={PALETTE.muted}
                  strokeWidth="1.25"
                  markerStart="url(#arrow-bw)"
                />
              )}
            </g>
          );
        })}

        {/* tail null marker for non-circular singly/doubly */}
        {variant !== "circular" && (
          <text
            x={totalW - 18}
            y={H / 2 + 4}
            fontFamily="ui-monospace, monospace"
            fontSize="11"
            fill={PALETTE.muted}
            textAnchor="end"
          >
            NULL
          </text>
        )}
      </svg>
    </VizFrame>
  );
}
