export type TocItem = { id: string; text: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
