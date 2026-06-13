## 2025-02-18 - Heavy Model Fields and Unpaginated Lists
**Learning:** In `src/app/problems/page.tsx`, `prisma.problem.findMany` fetched all fields by default on an unpaginated list, loading massive strings like `statementMd`, `examplesJson`, and `starterCodeJson` into memory and transit unnecessarily.
**Action:** Always prefer `select` over `include` when fetching list views for Prisma models containing large text/JSON columns to avoid ballooning memory and transit size, especially when not paginating.
