"use client";

import * as React from "react";

/**
 * Callout — editorial side-note rendered through the manuscript annotation
 * system. Mirrors the markdown `> [!TONE]` blockquotes so authored callouts
 * inside viz blocks visually agree with margin notes in the body.
 */
const TONE_CLASS: Record<string, string> = {
  intuition: "tone-insight",
  pitfall: "tone-pitfall",
  insight: "tone-insight",
  note: "tone-note",
  margin: "tone-margin",
};

const TONE_DEFAULT_TITLE: Record<string, string> = {
  intuition: "Intuition",
  pitfall: "Pitfall",
  insight: "Insight",
  note: "Note",
  margin: "Note",
};

export function Callout({
  tone = "note",
  title,
  body,
}: {
  tone?: keyof typeof TONE_CLASS;
  title?: string;
  body?: string;
}) {
  const cls = TONE_CLASS[tone] ?? TONE_CLASS.note;
  const label = title ?? TONE_DEFAULT_TITLE[tone] ?? "Note";
  return (
    <aside className={`annotation ${cls}`} role="note">
      <span className="annotation-label">{label}</span>
      <p>{body}</p>
    </aside>
  );
}
