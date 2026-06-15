## 2025-02-18 - Heavy Model Fields and Unpaginated Lists
**Learning:** In `src/app/problems/page.tsx`, `prisma.problem.findMany` fetched all fields by default on an unpaginated list, loading massive strings like `statementMd`, `examplesJson`, and `starterCodeJson` into memory and transit unnecessarily.
**Action:** Always prefer `select` over `include` when fetching list views for Prisma models containing large text/JSON columns to avoid ballooning memory and transit size, especially when not paginating.
## 2026-06-14 - Prevent Heavy Field Over-fetching in Problem Lists
**Learning:** Prisma models with large text/JSON fields (like `Problem` containing `statementMd` and `examplesJson`) cause unnecessary database load and memory bloat when fetched in list views using `include`.
**Action:** Always prefer `select` over `include` for list fetches (like dashboard history or related problems) to retrieve only the fields required for rendering cards (e.g., `id`, `slug`, `title`, `difficulty`).

## 2026-06-15 - Unpaginated Data Structure Memory Bloat in Roadmap
**Learning:** In `src/app/roadmap/page.tsx`, `prisma.track.findUnique` fetches deeply nested relationships (modules -> topics -> articles/problems). By default, fetching `articles` and using `include` for `problems` fetches all columns, including massive unneeded fields like `contentMd` and `statementMd`. Since the roadmap displays many entities at once, this caused huge memory and transit bloat.
**Action:** When querying lists or deeply nested structures (like roadmaps or dashboards), always explicitly use `select` to specify exactly the minimum required fields, particularly avoiding markdown strings or large JSON blobs.
