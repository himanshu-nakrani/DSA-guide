import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ARTICLE_DIR = path.join(__dirname, "..", "prisma", "content", "articles");
const LEVELS = new Set(["FOUNDATION", "INTERMEDIATE", "ADVANCED"]);
const VIZ_TYPES = new Set([
  "callout",
  "complexity-chart",
  "growth-table",
  "array-memory",
  "binary-search",
  "linear-vs-binary",
  "two-pointers",
  "sliding-window",
  "hash-table",
  "linked-list",
  "stack-queue",
  "tree-traversal",
  "graph-traversal",
  "dp-grid",
  "dijkstra",
  "recursion-tree",
  "architecture",
  "invariant-trace",
  "knowledge-check",
  "proof-builder",
  "tree-dp",
  "dag-scheduler",
  "bellman-ford-pass",
  "dp-decision-trace",
  "edit-path-reconstructor",
]);
const errors: string[] = [];

type VizConfig = { type?: unknown; props?: unknown };

function fail(file: string, message: string) {
  errors.push(`${file}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validateKnowledgeCheck(file: string, props: Record<string, unknown>) {
  if (typeof props.question !== "string" || !props.question.trim()) {
    fail(file, "knowledge-check requires a non-empty string question.");
  }
  if (!Array.isArray(props.choices) || props.choices.length < 2) {
    fail(file, "knowledge-check requires at least two choices.");
    return;
  }
  for (const choice of props.choices) {
    if (!isRecord(choice) || typeof choice.label !== "string" || !choice.label.trim()) {
      fail(file, "every knowledge-check choice requires a non-empty string label.");
      break;
    }
  }
  if (!Number.isInteger(props.answer) || (props.answer as number) < 0 || (props.answer as number) >= props.choices.length) {
    fail(file, "knowledge-check answer must be a valid zero-based choice index.");
  }
}

function validateInvariantTrace(file: string, props: Record<string, unknown>) {
  if (props.values !== undefined && (!Array.isArray(props.values) || props.values.some((value) => typeof value !== "number"))) {
    fail(file, "invariant-trace values must be an array of numbers when provided.");
  }
  if (props.target !== undefined && typeof props.target !== "number") {
    fail(file, "invariant-trace target must be a number when provided.");
  }
}

function validateOptionalCaption(file: string, type: string, props: Record<string, unknown>) {
  if (props.caption !== undefined && (typeof props.caption !== "string" || !props.caption.trim())) {
    fail(file, `${type} caption must be a non-empty string when provided.`);
  }
}

function validateProofBuilder(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "proof-builder", props);
  if (props.question !== undefined && (typeof props.question !== "string" || !props.question.trim())) {
    fail(file, "proof-builder question must be a non-empty string when provided.");
  }
  if (props.steps !== undefined) {
    if (!Array.isArray(props.steps) || props.steps.length < 2) {
      fail(file, "proof-builder steps must contain at least two entries when provided.");
    } else if (props.steps.some((step) => !isRecord(step) || typeof step.label !== "string" || !step.label.trim())) {
      fail(file, "every proof-builder step requires a non-empty string label.");
    }
  }
  if (props.initialOrder !== undefined && (!Array.isArray(props.initialOrder) || props.initialOrder.some((index) => !Number.isInteger(index)))) {
    fail(file, "proof-builder initialOrder must be an array of integer indices when provided.");
  }
}

function validateTreeDPExplorer(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "tree-dp", props);
}

function validateDAGScheduler(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "dag-scheduler", props);
  if (props.mode !== undefined && props.mode !== "acyclic" && props.mode !== "cycle") {
    fail(file, "dag-scheduler mode must be acyclic or cycle when provided.");
  }
}

function validateBellmanFord(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "bellman-ford-pass", props);
  if (props.variant !== undefined && props.variant !== "negative-edge" && props.variant !== "negative-cycle") {
    fail(file, "bellman-ford-pass variant must be negative-edge or negative-cycle when provided.");
  }
}

function validateDPDecisionTrace(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "dp-decision-trace", props);
  if (props.mode !== undefined && props.mode !== "house-robber" && props.mode !== "kadane") {
    fail(file, "dp-decision-trace mode must be house-robber or kadane when provided.");
  }
  if (props.values !== undefined && (!Array.isArray(props.values) || props.values.length < 1 || props.values.length > 12 || props.values.some((value) => typeof value !== "number" || !Number.isFinite(value)))) {
    fail(file, "dp-decision-trace values must contain 1–12 finite numbers when provided.");
  }
}

function validateEditPathReconstructor(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "edit-path-reconstructor", props);
  for (const key of ["a", "b"]) {
    if (props[key] !== undefined && (typeof props[key] !== "string" || (props[key] as string).length > 12)) {
      fail(file, `edit-path-reconstructor ${key} must be a string of at most 12 characters when provided.`);
    }
  }
}

function validateVizBlocks(file: string, content: string) {
  for (const match of content.matchAll(/```viz\s*\n([\s\S]*?)```/g)) {
    try {
      const parsed = JSON.parse(match[1]) as VizConfig;
      if (!isRecord(parsed) || typeof parsed.type !== "string") {
        fail(file, "a viz block must contain an object with a string 'type'.");
        continue;
      }
      if (!VIZ_TYPES.has(parsed.type)) {
        fail(file, `uses unknown viz type '${parsed.type}'.`);
        continue;
      }
      if (parsed.props !== undefined && !isRecord(parsed.props)) {
        fail(file, "viz props must be an object when provided.");
        continue;
      }
      const props = (parsed.props ?? {}) as Record<string, unknown>;
      if (parsed.type === "knowledge-check") validateKnowledgeCheck(file, props);
      if (parsed.type === "invariant-trace") validateInvariantTrace(file, props);
      if (parsed.type === "proof-builder") validateProofBuilder(file, props);
      if (parsed.type === "tree-dp") validateTreeDPExplorer(file, props);
      if (parsed.type === "dag-scheduler") validateDAGScheduler(file, props);
      if (parsed.type === "bellman-ford-pass") validateBellmanFord(file, props);
      if (parsed.type === "dp-decision-trace") validateDPDecisionTrace(file, props);
      if (parsed.type === "edit-path-reconstructor") validateEditPathReconstructor(file, props);
    } catch {
      fail(file, "contains invalid JSON in a viz block.");
    }
  }
}

function validateArticle(file: string, knownSlugs: Set<string>) {
  const source = fs.readFileSync(path.join(ARTICLE_DIR, file), "utf8");
  const { data, content } = matter(source);
  const slug = typeof data.slug === "string" ? data.slug : "";
  const expectedSlug = file.replace(/\.md$/, "");

  for (const key of ["slug", "title", "summary", "topicSlug", "level", "order"]) {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      fail(file, `missing required frontmatter '${key}'.`);
    }
  }
  if (slug && slug !== expectedSlug) fail(file, `slug '${slug}' must match file name '${expectedSlug}'.`);
  if (typeof data.title !== "string" || data.title.length > 160) fail(file, "title must be a string of at most 160 characters.");
  if (typeof data.summary !== "string" || data.summary.length > 320) fail(file, "summary must be a string of at most 320 characters.");
  if (typeof data.topicSlug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.topicSlug)) {
    fail(file, "topicSlug must be a lowercase slug.");
  }
  if (!LEVELS.has(data.level)) fail(file, "level must be FOUNDATION, INTERMEDIATE, or ADVANCED.");
  if (!Number.isInteger(data.order) || data.order < 0) fail(file, "order must be a non-negative integer.");
  if (data.estimatedMins !== undefined && (!Number.isInteger(data.estimatedMins) || data.estimatedMins < 1 || data.estimatedMins > 240)) {
    fail(file, "estimatedMins must be an integer between 1 and 240.");
  }
  for (const key of ["references", "prerequisites"]) {
    if (data[key] !== undefined && !Array.isArray(data[key])) fail(file, `${key} must be an array when provided.`);
  }

  for (const match of content.matchAll(/\]\(\/learn\/([a-z0-9-]+)\)/g)) {
    if (!knownSlugs.has(match[1])) fail(file, `links to unknown article slug '${match[1]}'.`);
  }
  validateVizBlocks(file, content);
}

function main() {
  if (!fs.existsSync(ARTICLE_DIR)) throw new Error(`Article directory not found: ${ARTICLE_DIR}`);
  const files = fs.readdirSync(ARTICLE_DIR).filter((file) => file.endsWith(".md")).sort();
  const slugs = files.map((file) => file.replace(/\.md$/, ""));
  const knownSlugs = new Set(slugs);
  if (knownSlugs.size !== slugs.length) errors.push("Duplicate article filenames detected.");

  for (const file of files) validateArticle(file, knownSlugs);

  if (errors.length > 0) {
    console.error(`Content validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Content validation passed for ${files.length} article${files.length === 1 ? "" : "s"}.`);
}

main();
