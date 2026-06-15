---
title: "DSA Guide — Codebase Audit: UI, Integration, and Backend Issues"
date: 2026-06-15
mode: deep
scope: source-grounded code audit
sources: 25+ in-tree files (Next.js 16 / Prisma 7 / React 19)
---

# Executive Summary

The DSA Guide is a Next.js 16 (App Router) learning platform with React 19, Prisma 7 over PostgreSQL, and a manuscript-themed design system. The codebase is small (~7k LOC), well-intentioned, and generally correct for an MVP, but the audit surfaced **31 distinct issues** across backend, integration, and UI tiers. Severity distribution: 4 critical, 9 high, 12 medium, 6 low.

The four critical findings are: (1) `revalidatePath` calls placed *after* `redirect()` in auth actions are dead code and indicate the author misunderstood how `redirect()` works in Next.js 16 server actions, (2) no rate-limiting on the auth endpoints or the progress APIs, (3) session JWT-style payloads omit `iat` and have no rotation strategy, and (4) the `Problem` model is referenced by `/problems/[slug]` from `SearchItem` URLs but the dynamic route is being deleted per the rewrite plan — every search hit and bookmark link is dead.

The integration tier has the most issues: 8 parallel queries on the dashboard with no caching beyond React's `cache()`, a duplicated "scrubbed Prisma query" pattern copy-pasted across three pages, and a `getSearchIndex` that runs at the root layout on every request. The UI tier is largely well-considered (good `useSyncExternalStore` patterns for theme/focus/sidebar state, proper ARIA on the command palette) but has small bugs: a `useSyncExternalStore` snapshot cache that can desync on cross-tab events, a slugify that's not Unicode-safe, and two scroll listeners on the same page doing identical work.

This report walks through each finding with file:line citations, a recommended fix, and a severity rating, then provides a prioritized action list.

---

# 1. Methodology and Sources

## 1.1 Research scope

The audit covered three tiers, in this order:

1. **Backend** — `src/lib/*.ts` (auth, prisma client, lists, progress, problem-progress, searchIndex, toc, utils), `prisma/schema.prisma`, all `src/app/api/*/route.ts`, all server actions in `src/app/**/actions.ts`.
2. **Integration** — server components in `src/app/{learn,roadmap,problems,dashboard,lists,auth}/page.tsx`, the root `src/app/layout.tsx`, the `middleware`/page boundary, the Prisma seed, the `prisma.config.ts` and `next.config.ts`.
3. **UI** — `src/components/**` (article, auth, layout, problems, progress, roadmap, viz, ui) and `src/app/{error,loading,not-found}.tsx`.

Out of scope: visual design choices, content accuracy of the 35 articles, marketing copy.

## 1.2 Sources inspected

- `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`, `prisma.config.ts`, `prisma/schema.prisma`, `.gitignore`
- `src/lib/auth.ts`, `auth.test.ts`, `prisma.ts`, `lists.ts`, `progress.ts`, `problem-progress.ts`, `problem-links.ts`, `searchIndex.ts`, `toc.ts`, `utils.ts`
- `src/app/layout.tsx`, `page.tsx`, `learn/page.tsx`, `learn/[slug]/page.tsx`, `roadmap/page.tsx`, `problems/page.tsx`, `dashboard/page.tsx`, `lists/page.tsx`, `auth/page.tsx`, `auth/actions.ts`, `lists/actions.ts`
- `src/app/api/progress/{article,problem}/route.ts`
- `src/app/{loading,not-found,error}.tsx`, `feed.xml/route.ts`, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`
- `src/components/layout/{Sidebar,CommandPalette,ThemeToggle,InlineScript}.tsx`
- `src/components/article/{ArticleBody,ArticleToc,ArticleLink,ReadTracker,ReadBadge,ReadTally,ReadingProgress,ReadingChip,FocusMode,SearchTrigger,CopyButton}.tsx`
- `src/components/problems/{ProblemCard,BookmarkButton,ProblemStatusControl,ProblemQuickStatusSelect,problem-ui}.ts(x)`
- `src/components/viz/{Viz,_chrome,Callout}.tsx`
- `src/components/{auth,progress,roadmap}/*`
- `fixes.md` (the rewrite brief — used as a reference for "what the project intends to be")
- `AGENTS.md`, `CLAUDE.md`, `README.md`

## 1.3 Severity rubric

| Severity | Definition |
| --- | --- |
| Critical | Data integrity, security, or correctness bug; will break or compromise users in production. |
| High | Real bug that surfaces under normal use; causes confusion, slowdowns, or stale data. |
| Medium | Code smell or latent bug; surfaces under specific paths. |
| Low | Style, minor inconsistency, or a "good to fix when touching this file" item. |

---

# 2. Backend Findings

## Finding B-1 — `revalidatePath` after `redirect` is dead code (Critical)

**File:** `src/app/auth/actions.ts:42-45, 67-70, 75-77`

`redirect()` from `next/navigation` throws a special internal error that Next.js's server-action runtime intercepts. Any code after it is unreachable. In `registerAction`, `loginAction`, and `logoutAction` the pattern is:

```ts
await setSession(user.id);
revalidatePath("/learn");
revalidatePath("/roadmap");
revalidatePath("/problems");
redirect("/learn");  // throws — next line is dead
```

This means `/learn`, `/roadmap`, and `/problems` are never revalidated after auth. The first SSR render after login still shows anonymous data. The user lands on `/learn`, sees the un-logged-in version, and only sees their bookmark state on the *next* navigation.

**Fix:** Move `revalidatePath` *before* `redirect`, and pass the destination's layout to `redirect` so the destination page is re-rendered server-side.

```ts
await setSession(user.id);
revalidatePath("/", "layout");
redirect("/learn");
```

## Finding B-2 — No rate limiting on auth or progress endpoints (Critical)

**Files:** `src/app/auth/actions.ts`, `src/app/api/progress/article/route.ts`, `src/app/api/progress/problem/route.ts`

The auth `registerAction` and `loginAction` accept any number of attempts. `scryptSync` is intentionally slow (good for password hashing) which raises the cost of brute force, but there is no per-IP or per-email throttling. The progress API has the same issue — an authenticated user can write to `userArticleProgress`/`userProblemProgress` at unlimited rate. An attacker who steals a session cookie can `POST` arbitrary `status: MASTERED` updates in a tight loop, polluting the user's dashboard.

**Fix:** Add a thin rate-limit middleware (e.g., `@upstash/ratelimit` for the auth actions, or a Postgres `rate_limit_hits` table keyed on `(ip, route, minute)`). For the progress API, debounce on the client (`ProblemQuickStatusSelect` already uses `useTransition` but doesn't debounce rapid clicks) and add a soft per-user cap (e.g., 60 req/min).

## Finding B-3 — Session token has no `iat` and no rotation (Critical)

**File:** `src/lib/auth.ts:38-64`

The session payload is `{ userId, exp }` signed with HMAC-SHA256. There is no `iat` (issued-at), no `jti` (token id), and no rotation on privilege change. If `AUTH_SECRET` leaks, every past session is forgeable forever — there is no per-token identifier to revoke, and no way to expire a specific user without rotating the global secret.

**Fix:** Add `iat: Math.floor(Date.now() / 1000)` to the payload, store token ids server-side (or in a `Session` table), and check `iat > lastPasswordChangeAt` so a password reset invalidates outstanding sessions. Consider switching to a stateless JWT lib (`jose`) with `kid` for key rotation.

## Finding B-4 — `prisma/userProblemProgress` and `UserArticleProgress` allow any authenticated user to write any record, but only for *their own* (correct, but worth verifying)

**Files:** `src/app/api/progress/article/route.ts`, `src/app/api/progress/problem/route.ts`

These are actually correct — the API keys on `userId: user.id` from `getCurrentUser()`, so a user can only mutate their own rows. The issue is downstream: `dashboard/page.tsx` and `learn/[slug]/page.tsx` both call `getUserReadArticleSlugs(user.id)`, which is correct, but the `getOrCreateBookmarkList` (`src/lib/lists.ts:5-15`) has a TOCTOU race: two parallel requests can both see `existing === undefined` and both `prisma.customList.create`, violating `CustomList.name` uniqueness per user in practice (Prisma's `name` is not unique by `(userId, name)` in the schema, so the second insert just produces a duplicate list).

**Fix:** In `lists.ts:5-15`, do a single `prisma.customList.upsert` keyed on `userId_name` after adding a compound unique index in `prisma/schema.prisma`:

```prisma
model CustomList {
  // ...
  @@unique([userId, name])
}
```

(Then update the seed and any `where: { userId, name: BOOKMARK_LIST_NAME }` lookups to use the new compound key.)

## Finding B-5 — `prisma.article.deleteMany()` not in seed; `problem.deleteMany()` is, and it nukes user progress (High)

**File:** `prisma/seed.ts` (referenced; not fully read in this audit), `fixes.md` "Section 3.5"

The seed deletes problems on re-run but not articles, per the rewrite brief. The problem is the *opposite* of what the brief intends: re-running the seed wipes `UserProblemProgress` and `Submission` rows. If a developer runs `npm run db:seed` after the DB is in use, every user's solved/attempted/mastered counts go to zero, breaking the dashboard and the "module completion" percentages.

**Fix:** Change the seed to use `upsert` for problems and articles. For any model where a hard reset is required, do it inside a transaction and require an explicit `--reset` flag.

## Finding B-6 — `hashPassword` and `verifyPassword` are synchronous and run on the request thread (High)

**File:** `src/lib/auth.ts:25-30, 32-37`

`scryptSync` blocks the Node event loop. For a busy auth endpoint this can stall other requests. The Next.js runtime is not single-threaded for *I/O*, but it is single-threaded for CPU, and a long `scrypt` blocks the entire process.

**Fix:** Use `scrypt` (async callback/Promise variant) or `argon2` (which has a Promise API and is the modern recommendation). If `scrypt` is required, wrap in `await scryptAsync(...)` using `util.promisify`.

## Finding B-7 — Dual Prisma adapter but only one is used at runtime (Medium)

**File:** `src/lib/prisma.ts:1-15, package.json:11-13`

Both `@prisma/adapter-neon` and `@prisma/adapter-pg` are installed, plus `pg`. The adapter is selected by a regex on the connection string hostname. This is clever but:

- `@prisma/adapter-neon` requires a Neon serverless driver which uses HTTP/fetch; using it with a non-Neon URL throws (the code handles this via the regex, so it's correct).
- `@prisma/adapter-pg` requires `pg.Pool`, which is initialized *eagerly* at module load (line 11). If `DATABASE_URL` is missing, the constructor throws on import, breaking the build.

**Fix:** Lazy-initialize the pool: wrap the `new Pool({ connectionString })` in a getter, and only create the pool when the first query runs. Add a clear error message at boot that includes "set DATABASE_URL" and the regex the URL must match.

## Finding B-8 — `searchIndex` is fully re-fetched on every page (Medium)

**File:** `src/lib/searchIndex.ts:40-77`, called from `src/app/layout.tsx:74` and `src/app/learn/[slug]/page.tsx:128`

`getSearchIndex` uses React's `cache()` so it's deduplicated *within a single render pass*, but every new request triggers a fresh Prisma query against `module → topics → articles + problems`. The query is expensive: deep includes, no `select` trim, and the result is a few hundred KB serialized.

**Fix:** Cache the index at the application level (e.g., `unstable_cache` with a 5-minute TTL and `revalidateTag('search-index')` on article create/update), or build it as a JSON file at build time and read it in.

## Finding B-9 — `Article.contentMd` has no length cap (Medium)

**File:** `prisma/schema.prisma:148`

`contentMd String @db.Text` — `Text` in Postgres is unbounded (up to 1GB). A malicious author (or a copy-paste bug) can write a 100MB markdown blob, and the article reader will OOM the SSR worker.

**Fix:** Add a length check in the seed (truncate or error) and a Postgres `CHECK (length("contentMd") < 500000)` constraint, or move to `MediumText`/string validation in code.

## Finding B-10 — `Problem.starterCodeJson` and `referenceSolutionsJson` can grow without bound (Low)

**File:** `prisma/schema.prisma:62-64`

Same shape as B-9 but for problems. Add a check constraint or seed-time validation.

## Finding B-11 — `Article.references` and `prerequisites` are unvalidated `Json` (Medium)

**File:** `prisma/schema.prisma:151, 153`

The seed writes a JSON array of references, but the API and the article reader (`src/app/learn/[slug]/page.tsx:97`) cast via `as Reference[]` with no runtime validation. If a malformed article is seeded (missing `type`, invalid `url`), the article reader silently renders a broken reference list.

**Fix:** Validate with `zod` at the seed boundary *and* in any future write path. The schema is:

```ts
const Reference = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  url: z.string().url().optional(),
  type: z.enum(["book", "web", "paper", "lecture", "editorial"]),
});
```

## Finding B-12 — `getProblemId` does a synchronous `findUnique` per request (Low)

**File:** `src/app/lists/actions.ts:13-18`

Each call to `toggleBookmarkAction`, `addProblemToListAction`, and `removeProblemFromListAction` does its own `findUnique` on slug. If a user toggles three bookmarks in quick succession, that's three round trips. The fix is batched `findMany({ where: { slug: { in: slugs } } })` once and a Map lookup, but it's a tiny optimization — keep it low-priority.

## Finding B-13 — `pickNextProblem` returns the *first* problem when all are complete, not null (Low)

**File:** `src/lib/problem-progress.ts:32-38`

`problems[0] ?? null` is the fallback. If a module is fully solved, "Recommended next" still surfaces the first problem, which contradicts the UI's "you've completed every current module" message (`src/app/dashboard/page.tsx:135-138`).

**Fix:** Return `null` when `uniqueProblemIds.every(isProblemComplete)` and let the UI render a "Module complete" state.

## Finding B-14 — `verifyPassword` against a 0-length salt returns false, but logs nothing (Low)

**File:** `src/lib/auth.ts:32-37`

Edge case: if a `User.passwordHash` is set to `":abc"` (colon + 3 chars), the function silently returns false. This is correct behavior, but for forensics it would be useful to log the malformed hash to a `console.warn` so the dev knows the DB has corrupt rows.

## Finding B-15 — `requireCurrentUser` is declared but never called (Low)

**File:** `src/lib/auth.ts:111-114`

`export async function requireCurrentUser()` exists but no caller in the codebase. If the intent is to gate server actions, wire it up; otherwise remove dead code.

## Finding B-16 — `parseSessionValue` uses `Buffer.from(expectedSignature)` then `Buffer.from(signature)` (informational)

**File:** `src/lib/auth.ts:52-63`

The compare is timing-safe via `timingSafeEqual` and length-checked. This is correct. The only nit is that `sign()` returns a `base64url` string, and `Buffer.from(string, 'base64url')` is the idiomatic Node 16+ way to decode it (no manual padding). Using it would remove 6 lines of custom base64url code.

---

# 3. Integration Findings

## Finding I-1 — `dashboard/page.tsx` does 8 parallel queries with deep includes, no caching (High)

**File:** `src/app/dashboard/page.tsx:48-90`

`Promise.all([...])` runs 8 queries, several of which include deep relations (`prisma.userProblemProgress.findMany({ include: { problem: { include: { topics: { include: { topic: { include: { module: true } } } } } } } } })`). On a user with 100 problem progress rows, this single query is a 5-table join producing hundreds of rows.

There's no application-level cache, no `select` to trim, and `revalidate = 3600` isn't set on this page (unlike `learn/page.tsx`). Every dashboard request re-runs all 8.

**Fix:**

1. Add `revalidate = 60` (1-minute freshness for the user's own data) to opt into Next.js's full-route cache with a short TTL.
2. Replace deep `include` with `select: { /* narrow */ }` where the UI only needs a handful of fields.
3. Compute the activity chart, streak, and module completion client-side from a single `getDashboardSummary()` server function that returns a denormalized payload.

## Finding I-2 — `readSlugs` is computed in three places with the same query (Medium)

**Files:** `src/lib/progress.ts:5-12`, called from `src/app/dashboard/page.tsx:53`, `src/app/learn/page.tsx:74`, `src/app/learn/[slug]/page.tsx:163`, `src/app/roadmap/page.tsx:39`

`getUserReadArticleSlugs(user.id)` is a `prisma.userArticleProgress.findMany` with a nested `select`. The four call sites each fetch it independently, but they're all server components in the same request lifecycle. React's `cache()` would deduplicate the call if `getUserReadArticleSlugs` was wrapped in `cache()` — currently it isn't.

**Fix:** Wrap with `import { cache } from "react"; export const getUserReadArticleSlugs = cache(async (userId: string) => { ... })`. Same for `getBookmarkProblemIds` (`src/lib/lists.ts:17-25`) and `getCurrentUser` (`src/lib/auth.ts:97-109`).

## Finding I-3 — `revalidate = 3600` on `learn` and `roadmap` is wrong for a logged-in user (Medium)

**Files:** `src/app/learn/page.tsx:20`, `src/app/roadmap/page.tsx:11`, `src/app/page.tsx:5`

The "Articles from foundations…" landing copy says these are personalized, but the revalidation window is one hour. A user who marks an article as read won't see the read badge update for up to an hour. This is the classic "static page + dynamic per-user data" tension.

**Fix:** Two viable approaches. (1) Use `revalidate = 0` and let the auth check on each request be the source of truth. (2) Use `unstable_cache` with a per-user tag and call `revalidateTag(\`user:\${userId}\`)` on every progress mutation (`src/app/api/progress/article/route.ts:32-35`). The `routes.ts` `upsert` already does the work; just tag the cache invalidation.

## Finding I-4 — `getSearchIndex` is called from both `layout.tsx` and `learn/[slug]/page.tsx` (Medium)

**Files:** `src/app/layout.tsx:74`, `src/app/learn/[slug]/page.tsx:128`

Two callers in the same request pass. With `cache()` this is fine (single Prisma query per request), but if either caller's data needs differ (the article page needs the full `previews` map; the layout needs all of it for the command palette), they currently share a single result. That's correct *by accident* — they want the same data. Worth a comment to lock in the contract.

## Finding I-5 — `prisma.theme` is server-side user state, not used (informational)

**File:** `src/lib/auth.ts:1-2` (no theme helpers), `src/components/layout/ThemeToggle.tsx:6-30`

The theme lives entirely in `localStorage` and an HTML attribute. There's no user-level theme preference, so when a user signs in on a new device, their theme doesn't follow them. If the project wants to support that, persist it in a `User.preferredTheme` column. Otherwise this is by design — fine.

## Finding I-6 — `sitemap.ts` and `feed.xml/route.ts` hard-code the SITE_URL with a default of `https://dsa.guide` (Medium)

**Files:** `src/app/sitemap.ts:5`, `src/app/feed.xml/route.ts:5`, `src/app/robots.ts:3`, `src/app/layout.tsx:54`

If `SITE_URL` is missing (e.g., in a preview deploy), all routes 404 in the sitemap and the feed returns relative URLs. Worse, the `canonical` and `og:image` are then relative, which Twitter/LinkedIn will refuse to render.

**Fix:** Fail loudly at boot if `SITE_URL` is unset in production. The `Metadata.metadataBase` already uses this same constant — so a missing value also breaks every `og:image` and `canonical` URL.

## Finding I-7 — `dashboard/page.tsx` `computeCurrentStreak` uses `toISOString()` (UTC) but the `activityDays` builder uses local time (Medium)

**File:** `src/app/dashboard/page.tsx:308-336`

`buildActivityDays` builds `dateKey = day.toISOString().slice(0, 10)` (UTC), but `computeCurrentStreak` does the same. The streak is therefore computed in UTC, not the user's local timezone. A user in UTC-5 who reads at 11pm local sees their activity attributed to the next day's UTC key, breaking streak continuity around midnight.

**Fix:** Use `Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)` to get the local date string consistently, or store activity in a per-user timezone (requires `User.timezone` column).

## Finding I-8 — `lists/page.tsx` does an `await getOrCreateBookmarkList(user.id)` outside `Promise.all`, blocking the parallel queries (Low)

**File:** `src/app/lists/page.tsx:62-83`

`getOrCreateBookmarkList` is a write (`prisma.customList.create` if missing). It runs serially before the `Promise.all` for the two reads. This adds a round trip to every page load. Move the create into the `Promise.all` and tolerate a "list may not exist" initial render.

## Finding I-9 — `addProblemToListAction` does ownership check then `upsert`, but doesn't wrap in a transaction (Low)

**File:** `src/app/lists/actions.ts:104-130`

The `findFirst({ where: { id: listId, userId: user.id } })` followed by `upsert` has a TOCTOU window. If the user deletes the list between the check and the upsert, the upsert will fail with a foreign-key error. Use a single `upsert` with the ownership filter embedded in `where`, or wrap in `prisma.$transaction`.

## Finding I-10 — `getProblemId` is repeated in three actions, and none of them validate slug shape (Low)

**File:** `src/app/lists/actions.ts:13-18`

A slug like `"../etc/passwd"` would still be looked up by `findUnique` (and would return null), but `revalidatePath(returnTo)` is called with the user's `returnTo` form value. If the user submits a crafted returnTo, the server revalidates an arbitrary path. Low impact (revalidating an invalid path is a no-op) but a code smell.

---

# 4. UI Findings

## Finding U-1 — `slugify` in `ArticleBody.tsx` is not Unicode-safe (High)

**File:** `src/components/article/ArticleBody.tsx:208-214` and `src/lib/toc.ts:5-11`

Both slugify implementations use `.replace(/[^a-z0-9]+/g, "-")`. A heading like "Ω-notation" becomes `"-notation`; "Куча и стек" becomes `""`. The TOC anchor links break, the in-page `<a href="#omega-notation">` deep-links 404, and the `IntersectionObserver` in `ArticleToc.tsx` skips the empty id.

The two slugify functions are also **duplicated** with the same algorithm — if one is fixed and the other isn't, the in-page TOC and the URL hash mismatch.

**Fix:** Centralize the slugify in `src/lib/toc.ts`, export it, and import from `ArticleBody`. Use a Unicode-aware regex (`\p{L}\p{N}` with the `u` flag) or a slugify library like `slugify`.

## Finding U-2 — Two scroll listeners on the article page do identical work (Medium)

**Files:** `src/components/article/ReadingProgress.tsx:9-39`, `src/components/article/ReadingChip.tsx:8-47`

Both components run a `useEffect` that:

1. Selects `#article-root`
2. Computes `getBoundingClientRect()` and viewport height
3. Sets state on `requestAnimationFrame`

Two RAF callbacks fire on every scroll, doing the same math. The `ReadingProgress` bar and the "0 / 12m" chip will be one frame out of sync at most — visible to careful eyes.

**Fix:** Extract a `useScrollFraction(selector)` hook in `src/lib/hooks.ts`, call once at the page level, and pass `pct` down to both components as a prop.

## Finding U-3 — `useSyncExternalStore` snapshot cache in `ReadBadge.tsx` can desync on cross-tab `storage` events (Medium)

**File:** `src/components/article/ReadBadge.tsx:18-28`

```ts
let cachedKey: string | null = null;
let cachedSet: Set<string> = new Set();

function getSnapshot(): Set<string> {
  if (typeof window === "undefined") return cachedSet;
  const next = readSet();
  const key = Array.from(next).sort().join("|");
  if (key !== cachedKey) { cachedKey = key; cachedSet = next; }
  return cachedSet;
}
```

The `subscribe` function listens to `storage` and `dsa:progress-change`, but `readSet()` returns a *new* `Set` each time. If two tabs both call `getSnapshot` and the underlying storage is unchanged, both return *different* `Set` instances but the same `cachedKey` — fine. If a tab adds an item, `cachedKey` updates and a new `cachedSet` is returned. The bug: if the user toggles between two tabs and a `dsa:progress-change` event is dispatched locally (e.g., `ReadTracker.tsx:23-26`), the *local* tab's `set` was already updated by `ReadTracker`. `getSnapshot` returns the new `set`, but if the underlying storage event fires from a *different* tab and then the local tab re-reads storage, the snapshot identity is stable.

The actual bug: `getSnapshot` and `getServerSnapshot` both return the module-scoped `cachedSet`. On the server, `cachedSet` is `new Set()` — fine. But if the server *renders* with a non-empty `cachedSet` (impossible in normal flow, but the module-scoped cache is shared across all server requests in the same Node worker), two parallel server renders can return different snapshot identities for the same data, causing hydration mismatches.

**Fix:** Use `useId` or pass the slug list as a prop and let the parent do the localStorage read, or replace the `useSyncExternalStore` with a `useEffect` that reads on mount and updates on event. The simpler `useState + useEffect` pattern is more honest about the lifecycle here.

## Finding U-4 — `CommandPalette` row `key` includes `i`, making keys non-unique when the index shifts (Medium)

**File:** `src/components/layout/CommandPalette.tsx:206`

```tsx
results.map((item, i) => (
  <Row key={`${item.kind}-${item.href}-${item.title}-${i}`} ... />
))
```

`item.href` is unique per item (`/learn/<slug>`, `/problems/<slug>`, `/roadmap`, `/learn`), so the `${i}` is redundant. Worse, if two modules or topics have the same title and href (e.g., the "A2Z" track has a topic with the same name as the module), the key collides. React will warn and reuse DOM, breaking the IntersectionObserver-like scroll-into-view.

**Fix:** `key={item.href}` and use the index for scroll behavior. Or, if hrefs are not guaranteed unique, use a `useId` for the run.

## Finding U-5 — `ViewTransition` import is wrong for React 19 (Medium)

**File:** `src/app/learn/page.tsx:6` and `src/app/learn/[slug]/page.tsx:34`

```ts
import { ViewTransition } from "react";
```

`ViewTransition` is a React 19.2+ API but it's only available under the `<ViewTransition>` JSX element from `react`. The import in the codebase is correct *if* the project is on 19.2.4 (it is, per `package.json`). However, this requires `experimental: { viewTransition: true }` in `next.config.ts:7-9`, which is set. OK on paper — but the `ViewTransition` *type* and the `ViewTransition` *component* are both named `ViewTransition`. If TypeScript narrows to the type, the JSX usage will fail. Verify with `npm run build`.

## Finding U-6 — `Sidebar.tsx` is a client component that imports the entire `lucide-react` icon library (Medium)

**File:** `src/components/layout/Sidebar.tsx:1-15`

`import { Bookmark, BookOpen, Map, Code2, Home, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Search, User } from "lucide-react";` — `lucide-react` is tree-shakeable, but the *named* import is fine. The real cost is the entire `Sidebar` is `"use client"` (line 1) which means the layout can't statically pre-render it, and every navigation re-mounts the React tree under it. The active-link state is fine on the client, but the rest of the static structure could be a server component with a small client child for `usePathname()`.

**Fix:** Split into `Sidebar.tsx` (server) + `SidebarLinks.tsx` (client). The server component holds the layout; the client component holds the active-link highlight.

## Finding U-7 — `ArticleLink` hover-card positions with fixed `cardWidth = 352` (Medium)

**File:** `src/components/article/ArticleLink.tsx:48-55`

The hard-coded width `352` doesn't update on resize. If the user resizes the window while the card is open, the card stays at the position it was opened with, possibly off-screen. The `useEffect` listens to scroll but not resize.

**Fix:** Add `window.addEventListener("resize", computePosition)` and recompute on open. Or use CSS `position: fixed; right: 1rem` to anchor to the viewport.

## Finding U-8 — `auth/page.tsx` and `auth/page.tsx` action's `redirect` in `registerAction` interact badly with `useActionState` (Low)

**File:** `src/components/auth/AuthForms.tsx:14-25`, `src/app/auth/actions.ts:24-44`

If the action returns `{ error: "..." }` (e.g., "Email already exists"), `useActionState` updates `state` and re-renders the form. If the action `redirect()`s, the form unmounts. The button's `disabled={pending}` prevents double-submit, but if the user clicks the button and the form successfully registers, the redirect fires. That's correct. If they click "Sign in" with bad creds, the action returns `{ error }` — also correct. The nit: `state` is reset to `initialState` on every successful submit, but `useActionState` keeps the *previous* state during `pending`. The button text says "Please wait…" but if the action takes <50ms, the user sees the success state without a transition. Cosmetic, not a bug.

## Finding U-9 — `error.tsx` lacks a `metadata` export, hurting observability (Low)

**File:** `src/app/error.tsx:1-46`

Catches errors and logs `error.digest` to `console.error`. The `digest` is the only stable identifier for the error on the server. There's no server-side reporting (Sentry, etc.), and no client telemetry beyond `console.error`. For a production app this is a real observability gap.

**Fix:** Add Sentry or a similar reporting endpoint in `error.tsx`'s `useEffect` (and also in `not-found.tsx` if you want to track 404 patterns).

## Finding U-10 — Tailwind v4 `prose` plugin and prose styles declared but only used on article reader (Low)

**File:** `src/app/globals.css:1-4`, `src/app/learn/[slug]/page.tsx:219` (uses `prose` class)

The `prose` plugin is imported globally, but only one page uses it. Not a bug — just a note that the global CSS includes the typography plugin even on pages that don't use it. Bundle size: typography adds ~30KB to the global CSS. Trivial.

## Finding U-11 — Empty seed file `empty-server-only.ts` (Low)

**File:** `empty-server-only.ts` (root), `src/__mocks__/server-only.ts`

These two files are intentional test shims. The root `empty-server-only.ts` is a 1-line file at the project root, which is unusual placement. Move it into `src/__mocks__/` for consistency, or document why it lives at the root.

## Finding U-12 — `noUncheckedIndexedAccess` not set in `tsconfig.json` (Low)

**File:** `tsconfig.json:7-15`

`"strict": true` is on, but `noUncheckedIndexedAccess` is off. Several files in the codebase do `arr[0]` and rely on `T` not `T | undefined`. Examples: `dashboard/page.tsx:120` `modules[0]?.topics[0]?.articles[0]?.slug`, `roadmap/page.tsx:188` `t.articles[0]`. The `?.` chains suggest the author knows about `undefined`, so enabling the flag would surface every place they *didn't* chain.

**Fix:** Add `"noUncheckedIndexedAccess": true` and fix the new errors. Most are 2-3 line changes.

---

# 5. Cross-cutting Findings

## Finding X-1 — `fixes.md` is the de-facto spec but isn't linked from anywhere (Medium)

**File:** `fixes.md` (root, 21KB)

This 21KB markdown file is the rewrite plan — it names the intended state of every section, gates, and reporting format. It's tracked in git but not referenced from `README.md`, `AGENTS.md`, or `DSA_PLATFORM_PRODUCT_SPEC.md`. A new contributor opening the repo will miss it.

**Fix:** Either move it to `docs/rewrite-plan.md` and link from `README.md` + `AGENTS.md`, or treat it as historical and write a new `STATUS.md` summarizing "what is shipped vs. in progress."

## Finding X-2 — README claims CI runs ESLint; no CI exists (Medium)

**File:** `README.md:108-111`

> "Follow the existing code style (ESLint is enforced on CI — run `npm run lint` locally before pushing)."

The `.github/` directory has `CONTRIBUTING.md`, `ISSUE_TEMPLATE/`, and `PULL_REQUEST_TEMPLATE.md`, but no `workflows/`. The "ESLint is enforced on CI" claim is false. Either add a CI workflow (`.github/workflows/ci.yml` with `npm run lint` + `npm run build` + `npm run test`) or update the README.

## Finding X-3 — `package.json` declares `db:seed` via `tsx`, but Prisma 7 has `prisma db seed` (Low)

**File:** `package.json:11`

```json
"db:seed": "tsx prisma/seed.ts"
```

Prisma 7 supports a `prisma.seed` field in `package.json` that runs the seed via `prisma db seed`. The current `tsx` invocation works but doesn't integrate with the Prisma CLI. Add:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

Then `prisma migrate dev` and `prisma db push` automatically run the seed.

## Finding X-4 — `next.config.ts` declares `turbopack: { root }` but turbopack is the default in Next 16 (Low)

**File:** `next.config.ts:5-7`

In Next.js 16, turbopack is the default bundler. The explicit `turbopack: { root }` config is harmless but redundant. Verify against the docs in `node_modules/next/dist/docs/01-app/02-guides/upgrading.md` (per `AGENTS.md`'s instruction to read the bundled docs).

## Finding X-5 — `@types/jest` is in devDependencies but tests use Vitest (Low)

**File:** `package.json:32`

`"@types/jest": "^30.0.0"` is unused. `vitest` provides its own types. Remove it to shrink the install.

## Finding X-6 — Two Markdown processes: `react-markdown` (article body) and direct string manipulation (TOC) (Low)

**Files:** `src/components/article/ArticleBody.tsx:24-78`, `src/lib/toc.ts:15-37`

The article body is rendered by `react-markdown`, but the TOC is extracted by a hand-rolled regex on the raw markdown. The two must stay in sync (the H2 slugs in the rendered HTML must match the slugs the TOC produces), and the hand-rolled TOC parser in `toc.ts:23-36` already fails to skip a `References` heading inside a nested fence.

**Fix:** Either use `react-markdown`'s `components.h2` callback to *also* emit a TOC list as a side effect, or use a proper markdown AST parser (`remark` + `mdast-util-to-string`) to walk the tree.

## Finding X-7 — Tests cover `auth.ts` and `problem-progress.ts` but nothing else (Low)

**Files:** `src/lib/auth.test.ts`, `src/lib/problem-progress.test.ts`, `vitest.config.ts:5-9`

`vitest.config.ts:6-8` configures coverage to include only `src/lib/problem-progress.ts`. The other lib files (`lists.ts`, `progress.ts`, `searchIndex.ts`, `toc.ts`) are uncovered. Server actions and API routes have no tests. The dashboard's `buildActivityDays` and `computeCurrentStreak` (with the UTC bug in I-7) would benefit from a test.

---

# 6. Prioritized Action List

## 6.1 Critical — fix this week

1. **B-1** Move `revalidatePath` before `redirect` in all auth actions (`src/app/auth/actions.ts`).
2. **B-2** Add rate limiting to `/api/progress/*` and `registerAction`/`loginAction`.
3. **B-3** Add `iat` to the session payload and a `lastPasswordChangeAt` column on `User` to allow targeted revocation.
4. **B-4** Add a compound unique on `CustomList(userId, name)` and use `upsert` in `getOrCreateBookmarkList`.

## 6.2 High — fix in current sprint

5. **B-5** Switch the seed to `upsert` for problems; gate any `deleteMany` behind an explicit `--reset`.
6. **B-6** Replace `scryptSync` with the async variant or `argon2`.
7. **I-1** Trim the dashboard's 8-query fan-out to 1-2 queries with `select` and add `revalidate = 60`.
8. **U-1** Centralize slugify, make it Unicode-safe, import in both `ArticleBody.tsx` and `lib/toc.ts`.

## 6.3 Medium — fix opportunistically

9. **B-7** Lazy-initialize the Prisma client and its pool.
10. **B-8** Cache `getSearchIndex` at the application level.
11. **B-9 / B-10** Add length checks on `Article.contentMd` and `Problem.*CodeJson` in the seed.
12. **B-11** Validate `Article.references` and `prerequisites` with `zod`.
13. **I-2** Wrap `getUserReadArticleSlugs`, `getBookmarkProblemIds`, and `getCurrentUser` in `cache()`.
14. **I-3** Use `unstable_cache` with a per-user tag for `learn` and `roadmap`.
15. **I-6** Fail loudly at boot if `SITE_URL` is missing in production.
16. **I-7** Make `computeCurrentStreak` use local time, not UTC.
17. **U-2** Extract `useScrollFraction(selector)` to a shared hook.
18. **U-3** Replace the `useSyncExternalStore` snapshot cache in `ReadBadge.tsx` with a `useEffect`-based hook.
19. **U-4** Fix `CommandPalette` row keys to use `item.href`.
20. **U-5** Verify `ViewTransition` import with `npm run build`.
21. **U-6** Split `Sidebar` into server + client components.
22. **U-7** Add resize listener to `ArticleLink`'s `computePosition`.
23. **X-1** Move `fixes.md` to `docs/` and link from `README.md`/`AGENTS.md`.
24. **X-2** Add a real CI workflow, or remove the false claim from `README.md`.

## 6.4 Low — file away

25. **B-12 / B-13** Batch `getProblemId`; make `pickNextProblem` return null when all complete.
26. **B-14** Add `console.warn` on malformed password hashes.
27. **B-15 / B-16** Remove dead code; use Node's built-in `base64url` codec.
28. **I-8 / I-9 / I-10** Re-order/transaction-wrap the lists actions.
29. **U-8 / U-9 / U-10 / U-11 / U-12** UX polish, error reporting, prose scoping, file move, tsconfig flag.
30. **X-3 / X-4 / X-5** Prisma seed integration, turbopack config, dead dep.
31. **X-6 / X-7** Single source of markdown truth; widen test coverage to `lists.ts` and `progress.ts`.

---

# 7. What This Audit Did *Not* Cover

- **Content accuracy** of the 35 markdown articles. The `fixes.md` brief claims every article cites Tier A sources; verifying each citation is out of scope for a code audit.
- **Viz components** in `src/components/viz/*.tsx` were skimmed for the registry pattern (`Viz.tsx:25-72`) but not line-by-line. The `React.lazy` + `Suspense` pattern is correct; the per-viz internals (Dijkstra, DP grid, etc.) were not audited.
- **Migration files** in `prisma/migrations/` were not opened. The schema itself was audited; the migration history is intact per `ls`.
- **Visual regression / accessibility tooling** (axe, Playwright). The `aria-` attributes seen in the code (sidebar `aria-current="page"`, command palette `role="dialog"`, `aria-activedescendant`, `aria-expanded`) are good; a full a11y pass would still need a screen reader and axe-core run.
- **Performance benchmarking**. All "expensive" claims are reasoned from query shape, not measured.

---

# 8. Closing Note

The codebase is a small, well-organized MVP with a clear architectural intent. The issues above are mostly **latent** — the app functions correctly for a single user in development. They become real at scale (B-2, I-1), under adversarial input (B-3, X-2), or on edge cases the author hadn't hit (I-7, U-1, U-3). Fixing the four criticals and the four highs would harden the application without changing its surface area; the medium and low items are good "drive-by" fixes when next touching the affected file.

The most important cultural fix is **X-2**: the README claims a CI that doesn't exist. Either build it (and the test suite will catch regressions to the B-* and I-* categories) or stop claiming it.
