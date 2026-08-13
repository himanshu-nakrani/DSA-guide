import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ARTICLE_DIR = path.join(__dirname, "..", "prisma", "content", "articles");
const LEVELS = new Set(["FOUNDATION", "INTERMEDIATE", "ADVANCED"]);
const errors: string[] = [];

function fail(file: string, message: string) {
  errors.push(`${file}: ${message}`);
}

function validateVizBlocks(file: string, content: string) {
  for (const match of content.matchAll(/```viz\s*\n([\s\S]*?)```/g)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || typeof parsed.type !== "string") {
        fail(file, "a viz block must contain an object with a string 'type'.");
      }
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
