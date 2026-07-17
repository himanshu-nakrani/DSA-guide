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
