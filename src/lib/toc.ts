export type TocItem = { id: string; text: string };

/**
 * Convert an arbitrary heading (or anchor label) into a URL-safe slug.
 *
 * The previous implementation stripped every character outside `[a-z0-9]`,
 * which corrupted any heading containing accented Latin (e.g. "Café"), CJK,
 * Cyrillic, emoji, etc. — the slug ended up empty or visually identical to
 * another heading's slug, breaking the in-page TOC anchors.
 *
 * This version normalises the input to NFKD form (so "é" → "e" + combining
 * acute), drops the combining marks, and keeps every Unicode letter/digit
 * as well as ASCII alphanumerics. Runs of non-slug characters collapse
 * into a single hyphen and leading/trailing hyphens are trimmed.
 *
 * If the input has no slug-able characters, the empty string is returned.
 */
export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    // Strip combining marks (e.g. the acute on "é") so accented Latin
    // round-trips to a readable ASCII slug. Mark ranges cover all
    // combining diacritics in Unicode.
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    // Keep Unicode letters/numbers, plus ASCII alphanumerics. Everything
    // else becomes a separator.
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract H2 headings from a markdown document, mirroring the slug logic used
 * by `ArticleBody` so the IDs line up with what actually renders. Skips H2s
 * inside fenced code blocks.
 */
export function extractH2Toc(md: string): TocItem[] {
  const lines = md.split("\n");
  const out: TocItem[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[1].trim();
    if (text.toLowerCase() === "references") continue;
    out.push({ id: slugify(text), text });
  }
  return out;
}
