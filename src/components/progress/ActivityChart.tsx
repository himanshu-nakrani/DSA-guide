"use client";

import { useState } from "react";

export type ActivityDay = {
  dateKey: string;
  count: number;
  label: string;
};

/**
 * ActivityChart — hand-drawn SVG bar chart. Gridlines and
 * axis labels replace the old bare divs; hovering a column lifts its bar and
 * shows the exact day/count pair. No chart library — the whole thing is a
 * few rects and lines that theme through CSS variables.
 */
export function ActivityChart({ days }: { days: ActivityDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 560;
  const H = 200;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 30;
  const innerHeight = H - PAD_TOP - PAD_BOTTOM;
  const max = Math.max(1, ...days.map((day) => day.count));
  const slot = W / Math.max(1, days.length);
  const barWidth = slot * 0.52;

  const ticks = Array.from(new Set([0, 1, 2, 3].map((i) => Math.round((max * i) / 3))));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Activities over the last ${days.length} days`}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Gridlines + value labels */}
        {ticks.map((tick) => {
          const y = PAD_TOP + innerHeight - (tick / max) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={0}
                x2={W}
                y1={y}
                y2={y}
                stroke="var(--rule)"
                strokeWidth={tick === 0 ? 1.5 : 1}
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text
                x={0}
                y={y - 4}
                fontSize={9}
                fill="var(--pencil)"
                fontFamily="var(--mono-font)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Columns */}
        {days.map((day, index) => {
          const barHeight = day.count === 0 ? 2 : Math.max(4, (day.count / max) * innerHeight);
          const x = index * slot + (slot - barWidth) / 2;
          const y = PAD_TOP + innerHeight - barHeight;
          return (
            <g key={day.dateKey}>
              {/* generous invisible hit area */}
              <rect
                x={index * slot}
                y={PAD_TOP}
                width={slot}
                height={innerHeight + PAD_BOTTOM}
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
              />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill={
                  hovered === null
                    ? "var(--ink-blue)"
                    : hovered === index
                      ? "var(--ink-blue)"
                      : "var(--ink-blue-soft)"
                }
                opacity={hovered === null || hovered === index ? 1 : 0.55}
                style={{ transition: "opacity var(--dur-fast) var(--ease-out)" }}
              />
              <text
                x={index * slot + slot / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize={9.5}
                letterSpacing={1}
                fill={hovered === index ? "var(--ink)" : "var(--pencil)"}
                fontFamily="var(--mono-font)"
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover readout */}
      <div
        aria-live="polite"
        className="mt-1 h-5 font-mono text-caption uppercase tracking-[0.12em] text-muted-foreground"
      >
        {hovered !== null && days[hovered] ? (
          <span suppressHydrationWarning>
            {days[hovered].label} ·{" "}
            <span className="text-ink-blue tabular-nums">
              {days[hovered].count}
            </span>{" "}
            {days[hovered].count === 1 ? "activity" : "activities"}
          </span>
        ) : (
          <span className="opacity-0">·</span>
        )}
      </div>
    </div>
  );
}
