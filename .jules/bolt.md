## 2025-02-18 - Heavy Model Fields and Unpaginated Lists
**Learning:** In `src/app/problems/page.tsx`, `prisma.problem.findMany` fetched all fields by default on an unpaginated list, loading massive strings like `statementMd`, `examplesJson`, and `starterCodeJson` into memory and transit unnecessarily.
**Action:** Always prefer `select` over `include` when fetching list views for Prisma models containing large text/JSON columns to avoid ballooning memory and transit size, especially when not paginating.
## 2026-06-14 - Prevent Heavy Field Over-fetching in Problem Lists
**Learning:** Prisma models with large text/JSON fields (like `Problem` containing `statementMd` and `examplesJson`) cause unnecessary database load and memory bloat when fetched in list views using `include`.
**Action:** Always prefer `select` over `include` for list fetches (like dashboard history or related problems) to retrieve only the fields required for rendering cards (e.g., `id`, `slug`, `title`, `difficulty`).
