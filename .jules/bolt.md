## 2025-02-18 - Heavy Model Fields and Unpaginated Lists
**Learning:** In `src/app/problems/page.tsx`, `prisma.problem.findMany` fetched all fields by default on an unpaginated list, loading massive strings like `statementMd`, `examplesJson`, and `starterCodeJson` into memory and transit unnecessarily.
**Action:** Always prefer `select` over `include` when fetching list views for Prisma models containing large text/JSON columns to avoid ballooning memory and transit size, especially when not paginating.
## 2026-06-14 - Prevent Heavy Field Over-fetching in Problem Lists
**Learning:** Prisma models with large text/JSON fields (like `Problem` containing `statementMd` and `examplesJson`) cause unnecessary database load and memory bloat when fetched in list views using `include`.
**Action:** Always prefer `select` over `include` for list fetches (like dashboard history or related problems) to retrieve only the fields required for rendering cards (e.g., `id`, `slug`, `title`, `difficulty`).

## 2026-06-15 - Unpaginated Data Structure Memory Bloat in Roadmap
**Learning:** In `src/app/roadmap/page.tsx`, `prisma.track.findUnique` fetches deeply nested relationships (modules -> topics -> articles/problems). By default, fetching `articles` and using `include` for `problems` fetches all columns, including massive unneeded fields like `contentMd` and `statementMd`. Since the roadmap displays many entities at once, this caused huge memory and transit bloat.
**Action:** When querying lists or deeply nested structures (like roadmaps or dashboards), always explicitly use `select` to specify exactly the minimum required fields, particularly avoiding markdown strings or large JSON blobs.

## 2026-06-16 - Unpaginated Data Structure Memory Bloat in Article List
**Learning:** In `src/app/learn/page.tsx`, `prisma.topic.findMany` fetches deeply nested relationships (topics -> articles). By default, fetching `articles` fetches all columns, including massive unneeded fields like `contentMd` and `references`. Since the learn page displays many entities at once, this caused huge memory and transit bloat.
**Action:** When querying lists or deeply nested structures (like topic's articles), always explicitly use `select` to specify exactly the minimum required fields, particularly avoiding markdown strings or large JSON blobs.

## 2026-06-17 - Precomputing Search Strings in React
**Learning:** In search or filtering components, computing searchable strings inline during the render cycle or in a dependency array that changes often (like a query state) can cause main thread blocking on every keystroke.
**Action:** Precompute searchable strings (e.g., lowercasing and concatenating fields) in a `useMemo` that strictly depends on the data source, rather than the query input.

## 2026-06-18 - Replacing O(N²) Array Lookups with O(1) Sets in List Traversals
**Learning:** In list and dashboard views (like `src/app/dashboard/page.tsx`), iterating over items (like modules/topics) and checking an array of user state (like `readSlugs.includes(slug)`) inside `.map()`, `.filter()`, or `.find()` loops creates an O(N*M) or O(N²) performance bottleneck, blocking the main thread when user state scales.
**Action:** Always convert user state arrays into a `Set` (e.g., `const readSlugSet = new Set(readSlugs)`) before traversing lists, and use `.has()` for O(1) lookups to avoid O(N²) scaling issues.

## 2024-07-17 - [Optimizing Deep Prisma Relationships]
**Learning:** Prisma's `include` on deeply nested relations (like `topics.topic.module`) fetches all fields of the related models by default, which can be disastrous for memory and transit size when models contain large text fields (like `statementMd` or `examplesJson`), even if you are just trying to display a list view.
**Action:** Always prefer `select` over `include` when fetching list views or deeply nested relationships, explicitly listing only the required fields (e.g., `id`, `slug`, `name`). This keeps payload sizes minimal and avoids N+1 style data bloat.
## 2025-05-18 - Hidden O(N²) bottlenecks in array mapping
**Learning:** Using array inclusion methods like `.includes()` or `.some()` inside list traversals (such as React's `.map()` for rendering or graph adjacency loops) silently creates an O(N²) bottleneck, scaling quadratically with data size.
**Action:** When evaluating inclusion repeatedly inside a traversal, precompute the target array into a `Set` before the loop (or alongside it) and use `.has()` for strict O(1) lookups.

## 2024-08-01 - [Avoid Intermediate Array Allocations in Reduction Helpers]
**Learning:** Utilizing chained array methods (like `.filter().length` or chained `.find()`s) inside frequently called data reduction helpers (e.g., used in nested map renders like the roadmap module completion) causes unnecessary intermediate array allocations, memory pressure, and repeated O(N) traversals.
**Action:** When aggregating or finding items over a collection in performance-sensitive or heavily-nested loops, prefer explicit single-pass iteration (like `for...of`) and standard variables to track counts and conditions.
## 2026-08-02 - Prevent Hidden O(N) Array Allocations in Aggregations
**Learning:** Chaining array methods like `.flatMap().map().some()` or `.filter().length` in performance-sensitive views like the dashboard creates hidden O(N) array allocations and redundant O(N) traversals, blocking the main thread.
**Action:** Use explicit single-pass iteration (like `for...of`) when aggregating or searching over collections to prevent unnecessary allocations and redundant passes.

## 2026-08-03 - Prevent Hidden O(N) Array Allocations in Aggregations
**Learning:** Chaining array methods like `.flatMap().map().some()` or `.map().filter().sort().slice().map()` in performance-sensitive views creates hidden O(N) array allocations and redundant O(N) traversals, blocking the main thread.
**Action:** Use explicit single-pass iteration (like `for...of`) when aggregating or searching over collections to prevent unnecessary allocations and redundant passes. DO NOT do this for small constant-size arrays or simple concise conditions like `.filter(Boolean).length` as that hurts readability for unmeasurable gains.

## 2025-02-18 - Replacing Chained Array Methods with Single-Pass Iteration
**Learning:** Utilizing chained array methods like `.flatMap()`, `.map()`, and `.filter().length` inside frequently called data reduction loops (like rendering modules in a roadmap view) causes hidden O(N) intermediate array allocations and redundant O(N) traversals, adding significant overhead.
**Action:** Replace chained array allocations with single-pass explicit iteration (`for...of` loops) when processing nested lists to prevent unnecessary intermediate arrays and multiple traversals.

## 2026-08-04 - Prevent Hidden O(N) Array Allocations in Aggregations
**Learning:** Chaining array methods like `.flatMap().flatMap().map()` in performance-sensitive views creates hidden O(N) array allocations and redundant O(N) traversals, blocking the main thread.
**Action:** Use explicit single-pass iteration (like `for...of`) when extracting deeply nested fields (e.g. `track.modules -> module.topics -> topic.problems`) to prevent unnecessary allocations and redundant passes.
## 2026-08-05 - Prevent Hidden O(N) Array Allocations in Aggregations
**Learning:** Chaining array methods like `.map().map()` and spreading large arrays (e.g. `Math.max(...array)`) in performance-sensitive views creates hidden O(N) intermediate array allocations and redundant O(N) traversals. Large spreads also risk exceeding call stack limits (e.g., in `Math.max(...)`).
**Action:** Use explicit single-pass iteration (like `for...of`) when aggregating over collections (like extracting deeply nested fields or generating keys and maximums) to prevent unnecessary allocations, redundant passes, and V8 call stack size exceptions.

## 2025-02-18 - Prevent Hidden O(N) Array Allocations in Data Aggregation
**Learning:** Chaining array methods like `.flatMap().map()` (e.g. `topics.flatMap(t => t.articles.map(a => a.slug))`) alongside `.reduce()` in data aggregation tasks creates hidden O(N) array allocations and redundant O(N) traversals, blocking the main thread when traversing deeply nested data.
**Action:** Use explicit single-pass iteration (like `for...of`) and inline computation when aggregating deeply nested data structures to prevent unnecessary array allocations and redundant passes.

## 2026-09-05 - Binning into a complete record in the existing loop
**Learning:** `.map(status => data.filter(...))` over a tiny fixed enum is not a real bottleneck, but a second dedicated binning loop is wasted work if the page already walks the same array.
**Action:** Pre-allocate a complete `Record` of the displayed keys (not `Partial` + `!`) and fill buckets in the existing aggregation loop. Do not claim main-thread DoS for an async Server Component.
