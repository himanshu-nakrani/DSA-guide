# DSA-Guide — Rewrite plan

Scrap the patch-up approach. The app is moving in a different direction. This prompt is the full brief for the rewrite. Read it end-to-end before writing any code.

**Working dir:** `/Users/himanshu/Git/DSA-guide`
**Stack:** Next.js 16.2.7 / React 19 / Prisma 7 / Tailwind 4 / shadcn (Base UI underneath)
**Today:** 2026-06-03
**Hard rule (from `AGENTS.md`):** Read `node_modules/next/dist/docs/` for any Next.js API before using it. Your training data is stale on this version.

---

## What's changing

The previous direction treated "Problems" (LeetCode-style judging) as the core. That's not MVP1. The new shape:

1. **Learnings is the new core.** A complete DSA reference, basic → advanced, written from verified sources. This is what we're actually shipping.
2. **Problems is parked.** Replace the page with a clear "under construction" notice. Schema and data stay (don't delete) — they ship in MVP2.
3. **Everything else is rebuilt** to support the new shape. The current pages, routes, and component scaffolds were a UI prototype; treat them as a sketch, not a foundation.

## What to keep (don't touch)

- `prisma/schema.prisma` — keep all existing models (`User`, `Profile`, `Track`, `Module`, `Topic`, `Problem`, etc.). You will **add** new models, not edit or remove existing ones.
- `prisma/seed.ts` — keep the existing problem seed data. You'll extend the seed with article content; don't replace what's there.
- `src/lib/prisma.ts` — the singleton client.
- `src/lib/utils.ts` — `cn()` helper.
- `src/components/ui/*` — shadcn primitives. They use `@base-ui/react` under the hood. **Don't uninstall `@base-ui/react`** — it's actively imported by button, input, tabs, progress, separator, badge.
- `src/app/layout.tsx`, `src/app/globals.css` — keep the shell, edit navigation only.
- `package.json` dependencies — leave alone except where this prompt says otherwise.

## What to throw away

- `src/app/page.tsx` (current dashboard with fake metrics) — replace.
- `src/app/problems/[slug]/page.tsx` — replace with stub (see Section 4).
- `src/app/roadmap/page.tsx` — replace with the new Learn-aware version.
- `src/components/problem/ProblemWorkspace.tsx`, `src/components/editor/CodeEditor.tsx` — delete. No code editor in MVP1.
- `@monaco-editor/react` dependency — uninstall, no longer needed.

---

## Rules

- **Sections are ordered. Do not skip ahead.** Each ends with a gate (build + manual route walkthrough). Stop and report at every gate.
- **No new abstractions unless the prompt asks for one.** No utility folders, no "helpers", no premature components.
- **No invented features.** If something is ambiguous, ask. Don't add a search bar, dark mode toggle, breadcrumb component, etc. unless this prompt names it.
- **No fake data, no fake auth, no fake metrics.** If you can't compute a number honestly, don't show it.
- **Citation is mandatory** for every article (Section 3). No article ships without source attribution. This is non-negotiable.
- **Honest reporting at every gate.** Report what works, what doesn't, and what's still TODO. The previous pass claimed "applied" for work that wasn't done — don't repeat that.
- Never `git add .`. Never destructive git.

---

## Section 1 — Foundation cleanup

### 1.1 Remove the dead editor stack

- Delete `src/components/problem/ProblemWorkspace.tsx`.
- Delete `src/components/editor/CodeEditor.tsx`.
- Delete the now-empty `src/components/problem/` and `src/components/editor/` directories.
- `npm uninstall @monaco-editor/react`.

### 1.2 Move the misplaced index

`prisma/schema.prisma:97` — `@@index([status, difficulty])` is wedged between the `topics` relation field and the rest of the relations. Move it to **after** the last relation field on `Problem` (after `customListItems`). Block-level attributes go at the bottom of the model body.

### 1.3 Run the missing migration

No `prisma/migrations/` directory exists. The schema changes from the earlier pass were never persisted.

```
npx prisma migrate dev --name baseline
npx prisma generate
npm run db:seed
```

If the DB isn't reachable, **stop and report** the error verbatim. Do not use `db push --force-reset` or any destructive flag.

### 1.4 Gate

- `npx prisma validate` passes.
- `npm run db:seed` succeeds.
- `npx tsc --noEmit` passes.
- `npm run build` passes.
- Report: confirm `@monaco-editor/react` no longer appears in `package.json`, and the two component directories are gone.

---

## Section 2 — New navigation + shell

The app has three primary surfaces after the rewrite:

| Route | Purpose | Status |
|---|---|---|
| `/` | Landing / overview | New |
| `/learn` | Learnings index — the new core | New |
| `/learn/[slug]` | Article reader | New |
| `/problems` | Under construction stub | Deferred to MVP2 |
| `/roadmap` | Curriculum view, links to articles | Refactored |

### 2.1 Sidebar

**File:** `src/components/layout/Sidebar.tsx`

- Replace the nav items entirely. Final list, in order:
  1. `/` — Home (icon: `Home`)
  2. `/learn` — Learn (icon: `BookOpen`)
  3. `/roadmap` — Roadmap (icon: `Map`)
  4. `/problems` — Problems (icon: `Code`) — render with `(soon)` text muted, or a `Badge variant="secondary"` saying "Soon"
- Make the file `"use client"`. Use `usePathname()` from `next/navigation` to mark the active link (`bg-accent text-accent-foreground` + `aria-current="page"`).
- Drop the `Trophy`, `List`, `MessageSquare`, `User` items entirely — those features aren't in MVP1.

### 2.2 Landing page

**File:** `src/app/page.tsx` (rewrite, don't extend)

A simple welcome screen. No metrics, no streaks, no fake "Today's Plan."

Content:
- `<h1>` — "Master DSA, the right way."
- One paragraph (≤ 2 sentences) describing what the platform is: a structured DSA curriculum with articles sourced from verified references.
- Three feature cards (use `Card`), each linking to a route:
  - **Learn** — "Articles from foundations to advanced topics, with citations." → `/learn`
  - **Roadmap** — "A guided path from arrays to advanced graphs." → `/roadmap`
  - **Problems** — "Coding practice — coming in the next release." → `/problems` (the card is clickable but the destination is the stub)
- Don't add CTAs to "sign up" — there's no auth.
- Don't add testimonials, social proof, footer links, or marketing copy beyond the one paragraph.

### 2.3 Gate

- `npm run dev`, click through `/`, `/learn` (will 404 — that's expected for this gate), `/roadmap` (still old code, expected), `/problems` (still old code, expected). Verify sidebar highlights the right link on each.
- `npm run build` passes.

---

## Section 3 — Learnings (the main work)

This is the meat of the rewrite. Build it carefully.

### 3.1 Schema

**File:** `prisma/schema.prisma` (add, don't modify existing models)

Add:

```prisma
model Article {
  id              String         @id @default(cuid())
  slug            String         @unique
  title           String
  summary         String
  topicId         String
  topic           Topic          @relation(fields: [topicId], references: [id], onDelete: Cascade)
  level           ArticleLevel
  order           Int            // ordering within (topic, level)
  contentMd       String         @db.Text
  references      Json           // [{ title, author, url, type }]
  prerequisites   Json?          // optional [articleSlug, ...]
  estimatedMins   Int            @default(10)
  status          ArticleStatus  @default(PUBLISHED)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([topicId, level, order])
  @@index([status])
}

enum ArticleLevel {
  FOUNDATION
  INTERMEDIATE
  ADVANCED
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

Add the back-relation to `Topic`:
```prisma
articles  Article[]
```

Migrate:
```
npx prisma migrate dev --name add_articles
npx prisma generate
```

### 3.2 Content scope for this PR

We're not writing the entire DSA universe in one pass. **Ship Tier 1 only.** Tier 2 and Tier 3 are documented at the bottom of this section for reference but are out of scope.

**Tier 1 — Foundations through Intermediate (this PR):**

Each `Topic` below maps to one or more articles. Create the topics if they don't exist in the seed. The numbers in parens are target article counts.

- **Complexity & Analysis** (2): Asymptotic notation; Amortized analysis basics.
- **Arrays & Strings** (3): Array fundamentals; String manipulation; Two pointers.
- **Hashing** (2): Hash tables — how they work; Collision handling and load factor.
- **Prefix Sums & Sliding Window** (2): Prefix sums (1D and 2D); Sliding window patterns.
- **Binary Search** (2): Binary search on sorted arrays; Binary search on the answer.
- **Sorting** (2): Comparison-based sorts (merge/quick/heap); Non-comparison sorts (counting/radix).
- **Linked Lists** (2): Singly and doubly linked lists; Common patterns (reverse, cycle detection, merge).
- **Stacks & Queues** (2): Stack and queue fundamentals; Monotonic stack/queue.
- **Recursion & Backtracking** (2): Recursion fundamentals; Backtracking template (subsets, permutations, N-queens).
- **Trees** (3): Binary tree traversals; Binary search trees; Heap and priority queue.
- **Tries** (1): Trie fundamentals.
- **Disjoint Set Union** (1): Union-Find with path compression and union by rank.
- **Graph Fundamentals** (2): Representations and traversal (BFS/DFS); Topological sort.
- **Shortest Paths** (2): Dijkstra; Bellman-Ford and 0-1 BFS.
- **Dynamic Programming I** (3): DP fundamentals (memoization vs tabulation); 1D DP patterns; 2D DP and grid problems.
- **Greedy** (1): Greedy intuition and exchange arguments.

Target: ~32 articles. **Quality over count.** If you can only write 20 well-cited articles by the end of this section, ship 20.

**Tier 2 (out of scope, do not start):** Segment trees, Fenwick trees, MST, SCC, bipartite matching, advanced DP (interval, bitmask, digit, tree DP), KMP/Z, suffix structures, modular arithmetic, sieve, combinatorics, matrix exponentiation.

**Tier 3 (out of scope, do not start):** Persistent DS, HLD, centroid decomposition, Mo's, sqrt decomposition, CHT, FFT/NTT, Sprague-Grundy.

### 3.3 Verified sources — citation policy

**Every article must cite at least two of the following sources.** Inline citations in the prose (numbered) plus a `references` field on the model. Do not invent URLs. If you don't know a URL, omit it and cite the source by name + edition.

**Tier A — primary references (prefer these):**
- CLRS — *Introduction to Algorithms*, 4th ed. (Cormen, Leiserson, Rivest, Stein). Cite by chapter.
- Sedgewick & Wayne — *Algorithms*, 4th ed.
- Laaksonen — *Competitive Programmer's Handbook* (free PDF, well-regarded).
- MIT OCW 6.006 / 6.046 lecture notes.
- Stanford CS161 lecture notes.
- cp-algorithms.com (translated e-maxx; the canonical free reference for competitive algorithms).
- USACO Guide — usaco.guide.

**Tier B — supplementary (cite alongside a Tier A source, not alone):**
- LeetCode official editorials.
- Codeforces educational blog posts by authors with title ≥ Master.
- takeUforward.org (Striver's A2Z — already referenced in the seed).
- The Algorithm Design Manual (Skiena).

**Excluded:** Random Medium posts, GeeksforGeeks (variable quality; not reliable enough to cite as primary), random YouTube transcripts, ChatGPT/LLM-written articles, unverified personal blogs.

**Format for the `references` JSON field:**
```json
[
  { "title": "Introduction to Algorithms, 4th ed., Ch. 12 (Binary Search Trees)", "author": "Cormen, Leiserson, Rivest, Stein", "type": "book" },
  { "title": "Binary Search Tree", "url": "https://cp-algorithms.com/data_structures/binary_search_tree.html", "type": "web" },
  { "title": "Lecture 5: BSTs", "url": "https://ocw.mit.edu/...", "author": "MIT 6.006", "type": "lecture" }
]
```

`type` is one of: `book`, `web`, `paper`, `lecture`, `editorial`.

### 3.4 Article structure

Each article's `contentMd` follows this skeleton. Don't deviate.

```
## Overview
[2–4 sentences: what the topic is, why it matters, when to use it]

## Prerequisites
[List of prior articles, or "None" for foundation topics]

## Core Idea
[The intuition. Plain prose, no jargon dump.]

## Mechanics
[How it works. Include pseudocode in fenced code blocks.
 Use language-agnostic pseudocode unless the topic is language-specific.]

## Complexity
[Time + space, with brief justification.]

## Common Patterns
[2–4 worked patterns showing where this idea appears.
 Each pattern: 1-line problem statement, key insight, complexity.]

## Pitfalls
[3–5 bullets of common mistakes. Be specific.]

## Practice
[3–6 problems by name. Don't link — these tie into the Problems track in MVP2.]

## References
[Numbered list mirroring the `references` JSON field.]
```

Length guideline: 600–1500 words of prose per article (excluding code blocks). Shorter is fine if the topic is small. Longer means you're padding.

### 3.5 Seeding the articles

**File:** `prisma/seed.ts` (extend, don't replace)

Don't paste 32 articles as inline strings in `seed.ts` — that file becomes unreadable. Instead:

- Create `prisma/content/articles/` as a directory of `.md` files, one per article, with frontmatter:
  ```
  ---
  slug: binary-search-fundamentals
  title: Binary Search on Sorted Arrays
  topicSlug: binary-search-basics
  level: FOUNDATION
  order: 1
  estimatedMins: 12
  references:
    - { title: "Introduction to Algorithms 4e, Ch. 2", author: "CLRS", type: "book" }
    - { title: "Binary Search", url: "https://cp-algorithms.com/num_methods/binary_search.html", type: "web" }
  prerequisites: []
  ---

  ## Overview
  ...
  ```
- Add `gray-matter` to dependencies: `npm install gray-matter`.
- In `seed.ts`, after the existing problem seed: scan `prisma/content/articles/*.md`, parse frontmatter + body, and `upsert` an `Article` row for each. Use `upsert` (not `create`) keyed on `slug` so re-running the seed is idempotent.
- If a `topicSlug` doesn't exist yet, **upsert the topic too** under a "Learnings" module of the existing track. Don't fail the seed because the topic is missing.
- The existing problem seed is `prisma.problem.deleteMany()` etc. — leave that alone. **Do not** add `prisma.article.deleteMany()`; rely on upserts.

### 3.6 The `/learn` index

**File:** `src/app/learn/page.tsx` (new, server component)

- Fetch all published articles grouped by topic, ordered by `(topic.module.order, topic.order, article.level, article.order)`:
  ```ts
  const topics = await prisma.topic.findMany({
    where: { articles: { some: { status: "PUBLISHED" } } },
    include: {
      module: true,
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: [{ level: "asc" }, { order: "asc" }],
      },
    },
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
  });
  ```
- Render as sections grouped by module → topic. For each article, show: title, one-line summary, level badge (color: FOUNDATION=green, INTERMEDIATE=yellow, ADVANCED=red), estimated reading time, and a link to `/learn/[slug]`.
- No search, no filters, no sort dropdown. The hierarchy is the navigation.
- Empty state: if no articles are published yet, render a single line ("No articles published yet."). No skeleton, no spinner — this is a server component.

### 3.7 The article reader — `/learn/[slug]`

**File:** `src/app/learn/[slug]/page.tsx` (new, server component, `params: Promise<{ slug: string }>`)

- Fetch by slug. If not found, `notFound()` from `next/navigation`.
- Layout:
  - Top bar: breadcrumb (`Learn / <topic name> / <article title>`), level badge, estimated reading time.
  - Article body — render markdown.
  - References section — numbered list, hyperlinks where the source has a URL.
  - Prev / Next links at the bottom (next article in the same topic by `(level, order)`).
- **Markdown rendering** is required here (it was out of scope for problems, but Learnings *is* the product — it has to render properly).
  - Use `react-markdown` + `remark-gfm` (for tables, strikethrough, task lists).
  - For code blocks: use `react-markdown`'s `components` prop to render `<pre><code>` with `tailwind`'s `prose` plugin styling. **Do not install a heavy syntax highlighter** (no Prism, no Shiki) in this pass. Plain monospace blocks are fine for MVP1.
  - Install: `npm install react-markdown remark-gfm`.
  - Wrap the rendered content in `<article className="prose prose-neutral dark:prose-invert max-w-none">`.
  - Add `@tailwindcss/typography` if it isn't already pulled in by the Tailwind 4 / shadcn setup. Check first; don't double-install.
- **Do not** add a comments section, share buttons, "did this help?" feedback, or sticky TOC. Out of scope.

### 3.8 The `/roadmap` rewrite

**File:** `src/app/roadmap/page.tsx` (rewrite)

- Fetch the `a2z-dsa-roadmap` track with all modules, topics, articles, and problems.
- Render as a vertical list of modules. For each module:
  - Module name + description.
  - List of topics. For each topic: name, count of articles (`<n> articles`), and count of problems (`<n> problems`).
  - Each topic links to the first article of that topic at `/learn/<slug>`.
- Strip the locked / in-progress / completed badges entirely. No fake progress.
- No progress bars.

### 3.9 Gate

- `npm run db:seed` succeeds and reports the number of articles upserted.
- `npm run build` passes.
- Walk through:
  - `/learn` — shows the topic hierarchy with real article links. List the modules and counts you see.
  - `/learn/<pick-a-real-slug>` — article renders with citations and prev/next. Confirm the references list links out.
  - `/learn/does-not-exist` — 404.
  - `/roadmap` — modules with real topic + article + problem counts.
- Pick 3 articles at random. For each, confirm:
  - It has ≥ 2 references, at least one from Tier A.
  - The structure matches the skeleton in 3.4.
  - It cites a real source (not invented).

**Stop here. Post the route walkthrough and the 3-article spot check before Section 4.**

---

## Section 4 — Problems stub

**File:** `src/app/problems/page.tsx` (rewrite)
**File:** `src/app/problems/[slug]/page.tsx` (delete)

- The list page becomes a simple "under construction" placeholder:
  - `<h1>Problems</h1>`
  - One paragraph: "The interactive coding workspace is coming in MVP2. In the meantime, the Learn section covers every topic with worked examples and references."
  - A button linking to `/learn`.
- Delete the `[slug]` route entirely. With no detail page, the dynamic route adds nothing.
- Keep the `Problem` model, the seed data, and the navigation entry in the sidebar (with the "Soon" badge from 2.1).

### 4.1 Gate

- `/problems` renders the stub.
- `/problems/two-sum` 404s (because the route is deleted) — confirm.
- Sidebar still shows the "Soon" badge.
- `npm run build` passes.

---

## Section 5 — Final polish

### 5.1 README

Replace with:

```
# DSA Guide

A structured DSA learning platform with topic articles sourced from verified references.

## Prerequisites
- Node 20+
- PostgreSQL (Neon, Supabase, or local), with `DATABASE_URL` in `.env`

## Setup
\`\`\`
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
\`\`\`

## Structure
- `prisma/content/articles/` — article markdown files, seeded into the DB.
- `src/app/learn/` — article index and reader.
- `src/app/roadmap/` — curriculum view.
- `src/app/problems/` — placeholder for MVP2.
```

No badges, no marketing.

### 5.2 Verify deps

After everything, `npm ls --depth=0` and report. Expected removals: `@monaco-editor/react`. Expected additions: `react-markdown`, `remark-gfm`, `gray-matter`, possibly `@tailwindcss/typography`.

### 5.3 Final gate

- `npm run build` — green.
- `npx tsc --noEmit` — 0 errors.
- `npm run lint` if configured — report.
- One walkthrough screenshot or text-description of `/`, `/learn`, one article page, `/roadmap`, `/problems`.

---

## Out of scope (do not start)

- Auth / user accounts / sign-in.
- Code editor / judging / Run / Submit. The Problem model stays unused at runtime.
- Article comments, ratings, bookmarks, "mark as read".
- Search (full-text or otherwise) over articles.
- Syntax highlighting in code blocks.
- Dark mode toggle (the CSS supports it; no UI control yet).
- Tier 2 and Tier 3 article content.
- Analytics, telemetry, error reporting.
- SEO metadata beyond `<title>` and `<description>` on the article reader.

If you finish early, **don't start any of these.** Document gaps in a new file (`next-steps.md`).

---

## Reporting format

One status block per section as you finish it:

```
Section X — done
  X.Y: <one-line summary>, file:line
  build: green
  tsc: 0 errors
  notes: <anything surprising or partial>
```

If blocked: stop, report verbatim, do not improvise. The previous two passes drifted because work was claimed done that wasn't. Tighten that.
