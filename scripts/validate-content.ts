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
  "dijkstra-lazy-heap",
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
  "zero-one-deque",
  "unique-paths-grid",
  "rolling-buffer-trace",
  "rerooting-propagation",
  "heap-operation-trace",
  "dsu-forest-trace",
  "kruskal-mst-trace",
  "monotonic-deque-window",
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

function validateDijkstraLazyHeap(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "dijkstra-lazy-heap", props);
  if (props.source !== undefined && (typeof props.source !== "string" || !/^[A-Z]$/.test(props.source))) {
    fail(file, "dijkstra-lazy-heap source must be a single uppercase letter when provided.");
  }
  if (props.edges !== undefined) {
    if (!Array.isArray(props.edges) || props.edges.length > 40) {
      fail(file, "dijkstra-lazy-heap edges must be an array with at most 40 entries when provided.");
    }
    for (const edge of props.edges as unknown[]) {
      if (
        !edge ||
        typeof edge !== "object" ||
        typeof (edge as Record<string, unknown>).from !== "string" ||
        typeof (edge as Record<string, unknown>).to !== "string" ||
        !/^[A-Z]$/.test((edge as Record<string, unknown>).from as string) ||
        !/^[A-Z]$/.test((edge as Record<string, unknown>).to as string) ||
        typeof (edge as Record<string, unknown>).weight !== "number" ||
        !Number.isFinite((edge as Record<string, unknown>).weight as number) ||
        ((edge as Record<string, unknown>).weight as number) < 0
      ) {
        fail(file, "dijkstra-lazy-heap edges must use uppercase endpoints and finite non-negative weights.");
      }
    }
  }
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

function validateZeroOneDeque(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "zero-one-deque", props);
  if (props.variant !== undefined && props.variant !== "valid" && props.variant !== "invalid-weight") {
    fail(file, "zero-one-deque variant must be valid or invalid-weight when provided.");
  }
}

function validateUniquePathsGrid(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "unique-paths-grid", props);
  if (props.obstacles !== undefined && (!Array.isArray(props.obstacles) || props.obstacles.length > 12 || props.obstacles.some((item) => typeof item !== "string" || !/^\d+,\d+$/.test(item)))) {
    fail(file, "unique-paths-grid obstacles must be at most 12 row,col strings when provided.");
  }
}

function validateRollingBufferTrace(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "rolling-buffer-trace", props);
  if (props.direction !== undefined && props.direction !== "backward" && props.direction !== "forward") {
    fail(file, "rolling-buffer-trace direction must be backward or forward when provided.");
  }
}

function validateRerootingPropagation(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "rerooting-propagation", props);
}

function validateHeapOperationTrace(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "heap-operation-trace", props);
  if (props.mode !== undefined && props.mode !== "heapify" && props.mode !== "sift-up" && props.mode !== "sift-down") {
    fail(file, "heap-operation-trace mode must be heapify, sift-up, or sift-down when provided.");
  }
}

function validateDSUForestTrace(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "dsu-forest-trace", props);
}

function validateKruskalMST(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "kruskal-mst-trace", props);
  if (props.edges !== undefined) {
    if (!Array.isArray(props.edges) || props.edges.length < 1 || props.edges.length > 40) {
      fail(file, "kruskal-mst-trace edges must contain 1–40 entries when provided.");
      return;
    }
    for (const edge of props.edges) {
      if (!isRecord(edge) || typeof edge.from !== "string" || typeof edge.to !== "string" || !/^[A-Z]$/.test(edge.from) || !/^[A-Z]$/.test(edge.to) || typeof edge.weight !== "number" || !Number.isFinite(edge.weight) || edge.weight < 0) {
        fail(file, "kruskal-mst-trace edges must use uppercase endpoints and finite non-negative weights.");
        break;
      }
    }
  }
}

function validateMonotonicDequeWindow(file: string, props: Record<string, unknown>) {
  validateOptionalCaption(file, "monotonic-deque-window", props);
  if (props.values !== undefined && (!Array.isArray(props.values) || props.values.length < 1 || props.values.length > 20 || props.values.some((value) => typeof value !== "number" || !Number.isFinite(value)))) {
    fail(file, "monotonic-deque-window values must contain 1–20 finite numbers when provided.");
  }
  if (props.windowSize !== undefined && (!Number.isInteger(props.windowSize) || (props.windowSize as number) < 1 || (props.windowSize as number) > 10)) {
    fail(file, "monotonic-deque-window windowSize must be an integer from 1 to 10 when provided.");
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
      if (parsed.type === "dijkstra-lazy-heap") validateDijkstraLazyHeap(file, props);
      if (parsed.type === "dag-scheduler") validateDAGScheduler(file, props);
      if (parsed.type === "bellman-ford-pass") validateBellmanFord(file, props);
      if (parsed.type === "dp-decision-trace") validateDPDecisionTrace(file, props);
      if (parsed.type === "edit-path-reconstructor") validateEditPathReconstructor(file, props);
      if (parsed.type === "zero-one-deque") validateZeroOneDeque(file, props);
      if (parsed.type === "unique-paths-grid") validateUniquePathsGrid(file, props);
      if (parsed.type === "rolling-buffer-trace") validateRollingBufferTrace(file, props);
      if (parsed.type === "rerooting-propagation") validateRerootingPropagation(file, props);
      if (parsed.type === "heap-operation-trace") validateHeapOperationTrace(file, props);
      if (parsed.type === "dsu-forest-trace") validateDSUForestTrace(file, props);
      if (parsed.type === "kruskal-mst-trace") validateKruskalMST(file, props);
      if (parsed.type === "monotonic-deque-window") validateMonotonicDequeWindow(file, props);
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
