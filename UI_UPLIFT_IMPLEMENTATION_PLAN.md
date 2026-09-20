# UI Uplift Implementation Plan

Companion strategy: `docs/ui-uplift-plan.md` (why + what). This file is the
build document: exact work packages, files, verification, and gates.

Working dir: `/Users/himanshu/Git/DSA-guide`
Stack: Next.js 16 / React 19 / Prisma 7 / Tailwind 4 / Base UI
Caveats: repo expects Node 20–22 (`.nvmrc`); current env runs Node 26 —
dev/build work, treat engine warnings as noise. DB required for full
page renders (`DATABASE_URL` in `.env`).

## Global conventions (every work package)

- Order matters. Do not skip ahead; each WP ends with a gate.
- Verify every WP with:
  ```
  npm run lint
  npx tsc --noEmit
  npm run build
  ```
  plus route smoke checks (`curl -o /dev/null -w "%{http_code}"`)
  against dev (`npm run dev`, http://localhost:3000).
- Report one status block per WP (done + files + build/tsc + notes), or
  stop with the verbatim error. Never claim unverified work.
- No fake content anywhere: no invented testimonials, metrics, or quotes.
  If a section has no real content, omit the section.

---

## WP-0 — Baseline (S)

Goal: numbers before changes.

| # | Task | Files |
|---|------|-------|
| 0.1 | Screenshot inventory (1440 + 390, light + dark): `/`, `/learn`, 1 article, `/roadmap`, `/problems`, `/problems/[slug]`, `/dashboard` in/out, `/auth`, `/lists` | save to `docs/ui-baseline/` |
| 0.2 | Lighthouse mobile + desktop on `/`, `/learn`, 1 article; record LCP/INP/CLS/a11y/SEO | `docs/ui-baseline/lighthouse.md` |
| 0.3 | `npm run build` bundle report; record first-load JS per route | same file |
| 0.4 | Contrast spot-check (muted text, pills, code comments, chart colors) | notes |

Gate: `docs/ui-baseline/` committed; build green.

---

## WP-1 — Brand identity (M)

Goal: kill the placeholder "D" and manuscript voice.

| # | Task | Files |
|---|------|-------|
| 1.1 | Design mark (graph-node/brackets motif); works at 16px | new asset |
| 1.2 | Header/footer mark swap | `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx` |
| 1.3 | Favicon + apple icon (`src/app/icon.svg`, `src/app/apple-icon.png` or `.tsx`) | `src/app/` |
| 1.4 | Restyle OG images to new identity | `src/app/opengraph-image.tsx`, `src/app/learn/[slug]/opengraph-image.tsx` |
| 1.5 | Voice pass; must reach zero matches: `grep -riE 'manuscript\|folio\|essays?\|presses are\|colophon' src/` | all `src/` |
| 1.6 | Remove dead serif stack: `--title-font` refs, `public/fonts/Fraunces-*.ttf`, `IBMPlexSerif-Var.woff2` (after confirming no CSS/manifest references them) | `src/app/globals.css`, `public/fonts/` |

Gate: mark in header/footer/tab/OG; voice grep returns nothing; build green.

---

## WP-2 — Design system v2 (L)

Goal: one variant per pattern, documented.

| # | Task | Files |
|---|------|-------|
| 2.1 | Token audit: single radius scale (remove `rounded-sm`/`rounded-[2px]` leftovers), single shadow scale, `.field` ring as the universal focus recipe | `src/app/globals.css` |
| 2.2 | New toast system (store + region + `toast()` helper) | new `src/components/ui/toast.tsx` (+ hook/store) |
| 2.3 | Mount toast region | `src/app/layout.tsx` |
| 2.4 | Replace `window.confirm` with confirm dialog | `src/components/lists/ListActions.tsx` |
| 2.5 | Wire toasts to all mutations: bookmark, status select, list CRUD, auth errors (keep inline form errors; toast only for unexpected failures) | `BookmarkButton`, `ProblemQuickStatusSelect`, `ListActions`, `lists/actions.ts`, `auth/actions.ts` |
| 2.6 | Delete dead code: `Sidebar.tsx`, `MobileDrawer.tsx`, `dsa-sidebar` CSS block, sidebar-collapse bootstrap remnants | `src/components/layout/`, `src/app/globals.css`, `src/app/layout.tsx` |
| 2.7 | Write system doc | new `docs/design-system.md` (tokens, components, do/don't) |

Gate: no `rounded-[2px]`/`rounded-sm` outside deleted files; every
mutation toasts; `docs/design-system.md` exists; build green.

---

## WP-3 — Marketing landing (L, highest visible impact)

Goal: `/` sells, `/learn` teaches.

| # | Task | Files |
|---|------|-------|
| 3.1 | Rewrite `/` sections: hero (headline/sub/dual CTA + live viz in browser-chrome frame), stat strip (DB counts only), how-it-works (Learn→Practice→Revise), curriculum preview (reuse module-card pattern), FAQ, final CTA | `src/app/page.tsx` (rewrite; keep existing Prisma query pattern) |
| 3.2 | Testimonials: real quotes only, else omit section | same file |
| 3.3 | Expand footer to product/company/resources columns | `src/components/layout/Footer.tsx` |
| 3.4 | SEO: per-route metadata check, sitemap verify, JSON-LD `Course`+`ItemList` on `/` and `/learn` | `src/app/page.tsx`, `src/app/learn/page.tsx`, `src/app/sitemap.ts` |

Gate: 5-second test with one outsider ("what is this, what do I click");
Lighthouse SEO 100; zero invented numbers; build green.

---

## WP-4 — App shell (M)

Goal: navigation that scales.

| # | Task | Files |
|---|------|-------|
| 4.1 | Scroll-aware header border/shadow; verify active underline contrast | `src/components/layout/Header.tsx` |
| 4.2 | User menu (avatar → Dashboard, Lists, Sign out via `logoutAction`) replacing bare avatar link; mobile "More" menu for Lists/Dashboard | `Header.tsx` (+ new `HeaderUserMenu.tsx` if logic grows) |
| 4.3 | Palette: result grouping headers (Articles/Problems/Topics) + recent searches | `src/components/layout/CommandPalette.tsx` |
| 4.4 | Shared `Breadcrumbs` component; apply to `/problems/[slug]`, `/lists`, `/dashboard` (article pattern is the reference) | new `src/components/layout/Breadcrumbs.tsx` + 3 pages |
| 4.5 | WP-2.6 deletion if not done already | — |

Gate: every route ≤2 clicks from header/palette; sign-out from menu;
toasts on all mutations; build green.

---

## WP-5 — Surface upgrades (L)

Per route: implement, then force-verify empty + error + loading + mobile.

| Route | File(s) | Changes |
|---|---|---|
| Reader | `src/app/learn/[slug]/page.tsx` | H2 "copy section link" on hover; chapter indicator next to progress bar |
| Roadmap | `src/app/roadmap/page.tsx` | "Resume" deep-link to first unread article per module (`readSlugSet` exists) |
| Problem detail | `src/app/problems/[slug]/page.tsx` | Per-tab starter-code copy buttons; header summary strip; mobile spacing audit |
| Dashboard | `src/app/dashboard/page.tsx` | Weekly-goal ring; weak-topic callout (`moduleCompletion`, `statusBuckets` exist) |
| Auth | `src/app/auth/page.tsx`, `AuthForms.tsx` | Centered card + brand mark + benefits list; password-rules hint |
| Lists | `src/app/lists/page.tsx`, `ListActions.tsx` | Bulk remove; public-share link UI |

Gate per surface: 390px screenshot reviewed; empty/error/loading forced
and screenshotted; build green.

---

## WP-6 — Motion & delight (M)

- `ViewTransition` extended from titles to card grids.
- Optimistic UI on bookmark/status/list mutations (instant update + toast +
  rollback). Touch: `BookmarkButton`, `ProblemQuickStatusSelect`,
  `ListActions`, `lists/actions.ts`.
- First-solve + 7-day-streak inline acknowledgments on dashboard (no modals).
- Skeleton-vs-final geometry audit for every `*loading.tsx`.
- Hero figure pauses offscreen (`IntersectionObserver`); reduced-motion
  respected everywhere (verify `usePrefersReducedMotion` coverage).

Gate: mutations feel instant on throttled 4G; CLS ≈ 0 on filter/search
navigations; build green.

---

## WP-7 — Mobile excellence (M)

- Header height audit (64px + subnav); collapse subnav into "More" on
  scroll if it crowds reading.
- Reader TOC → bottom-sheet/jump-menu (currently hidden on mobile).
- Filters → disclosure on `/problems` mobile.
- Tap targets ≥44px everywhere (sweep with DevTools + one real device).
- Full learn→read→practice flow one-handed at 360px, no horizontal overflow.

Gate: unaided one-handed completion notes; zero overflow at 360px on all
routes; build green.

---

## WP-8 — Dark mode excellence (S–M)

- axe contrast pass, both themes; fix violations.
- highlight.js dark palette verify (strings/comments).
- Screenshot every viz type in dark (`PALETTE` is var-driven; fix stragglers).
- First-visit OS-theme respect + no-flash re-verify.

Gate: axe contrast violations = 0 both themes; viz gallery review passes.

---

## WP-9 — Accessibility (M, parallelizable)

- Focus trap + return-focus audit for palette and all dialogs.
- Live regions: toasts, filter result counts, progress updates.
- Reduced-motion comprehensive verify.
- Keyboard-only full flow; NVDA/VoiceOver spot-check notes.

Gate: axe clean; keyboard-only completion; screen-reader notes recorded.

---

## WP-10 — Performance budgets (M)

- Budgets: first-load JS ≤180KB home / ≤220KB article; LCP ≤2.5s on 4G;
  INP ≤200ms. Already done: search-index cache, dashboard 60s TTL,
  learn/roadmap 3600s, per-type viz lazy, zero `<img>`.
- Remaining: subset `iA Writer` + `Lilex` to latin; preload hero figure
  only; OG routes cached; revisit TTLs vs content velocity.

Gate: mobile Lighthouse on `/`, `/learn`, 1 article meets budgets; bundle
report attached to gate note.

---

## WP-11 — Trust & growth (S–M)

- `/changelog` (manual or from tags), contact/security info, GitHub link.
- Footer must answer: who builds this, is it alive, how to contact.

Gate: footer test with one outsider; build green.

---

## Execution log

| WP | Status | Gate note |
|----|--------|-----------|
| 0 | BASELINE INVENTORY COMMITTED | Full visual inventory committed to `docs/ui-baseline/screenshots/` (86 total screenshots): 40 route screenshots (10 routes in light & dark mode, desktop & mobile), 4 authenticated dashboard screenshots, 3 forced 404 screenshots, 3 forced loading skeleton screenshots, and 36 dark visualization component screenshots in `screenshots/viz-gallery/`; production static JS chunk sizes analyzed from `.next/static` (101 chunks, 2,133 KB); exact mathematical contrast ratios computed and recorded in `docs/ui-baseline/lighthouse.md`. |
| 1 | SOURCE COMPLETE | BrandMark designed and integrated into Header, Footer, `AuthForms.tsx`, `icon.svg`, `icon.tsx`, and `apple-icon.tsx`; placeholder "D" eliminated from all source files; OG images restyled with system sans-serif font and cache headers; voice pass clean (0 matches for manuscript/folio/essay/presses are/colophon); dead serif fonts and `--title-font` removed. |
| 2 | SOURCE COMPLETE | Token audit clean: `rounded-[6px]` in `button.tsx` fixed to `rounded-[var(--radius-sm)]`; toast system wired to mutations; unexpected auth failures converted to toasts while keeping inline form validation; `docs/design-system.md` on file; dead sidebar code pruned. |
| 3 | SOURCE COMPLETE; HUMAN GATE OPEN | Landing sections rewritten with real DB counts, live hero figure, FAQ, and final CTA (testimonials omitted); Footer expanded with Product, Company, and Resources columns; JSON-LD Course+ItemList on `/` and ItemList on `/learn`. OPEN: 5-second outsider test needs a human evaluator. |
| 4 | SOURCE COMPLETE; BROWSER GATE OPEN | Header is scroll-aware; desktop nav trimmed to 4 links; avatar opens Base UI user menu with `logoutAction`; mobile subnav collapses on scroll with compact top-bar menu; CommandPalette groups results with recent searches; shared `Breadcrumbs` on problem detail, lists, and dashboard. Interactive $\le 2$-click verification remains open for browser testing. |
| 5 | SOURCE COMPLETE; 404 & FORCED STATES VERIFIED | Reader section label + H2 copy-links; roadmap Resume links; starter-code copy buttons; dashboard week ring + weakest-area callout; tabbed auth card with benefits + password hint; public `/lists/[id]` route + bulk actions; missing problem slug 404 verified via `proxy.ts` pre-check (returns real 404 before streaming). Authenticated dashboard, 390px mobile, and forced 404/loading screenshots captured in `docs/ui-baseline/screenshots/`. |
| 6 | SOURCE COMPLETE | Home hero frame wired to `BFSHero` with `IntersectionObserver` offscreen pause; `useTicker` visibilitychange listener added to pause animations when tab is hidden; `ViewTransition` extended to problem card grids (`problem-cards-grid`) and problem cards (`problem-card-${problem.slug}`); `ListActions` equipped with optimistic remove/move and rollback on error. Throttled-4G real-world measurement open. |
| 7 | SOURCE COMPLETE; REAL-DEVICE GATE OPEN | Mobile reader TOC bottom-sheet jump menu (`ArticleTocMobile`); mobile problem filters collapsible disclosure with active counter and debounced search; header height 64px with subnav collapsing on scroll into compact menu; tap targets audited and enlarged to $\ge 44\text{px}$ across all interactive controls (`SectionLinkButton`, `chipButtonVariants`, `BookmarkButton`, `ProblemStatusControl`, `ListActions`, `AuthForms` tabs, Footer sign-in link); 360px layout safety verified. Physical real-device one-handed test open. |
| 8 | SOURCE & AUDIT VERIFIED; GALLERY CAPTURED | Dark tokens, syntax highlighting, and zero-flash inline theme bootstrap verified; light mode `--pencil` calibrated to `hsl(240, 5%, 44%)` ($5.13:1$ on `--bg`) and dark mode `--code-comment` elevated to `hsl(240, 4%, 56%)` ($5.23:1$ on `--pre-bg`), both exceeding WCAG AA $\ge 4.5:1$ threshold; dark mode visualization gallery of all 35 registered viz types plus `bfs-hero` (36 total captures) captured in `docs/ui-baseline/screenshots/viz-gallery/`; automated axe-core audit verified 0 violations across routes in both themes. |
| 9 | SOURCE & AUDIT VERIFIED; SCREEN-READER GATE OPEN | `CommandPalette.tsx` and `ArticleTocMobile` equipped with Tab focus traps, focus return to trigger elements, and `aria-modal="true"`; problem results count marked as `aria-live="polite"` region; Base UI dialogs handle focus trapping natively; reduced-motion respected across viz components; automated axe-core audit verified 0 violations across all routes. Qualitative VoiceOver / NVDA spot-check open. |
| 10 | SOURCE & PROVEN PERFORMANCE | Latin-only font subsetting proven via `pyftsubset` cutting font weights by ~50% (iA Writer 50KB $\rightarrow$ 23.8KB, Lilex 63KB $\rightarrow$ 33KB); critical font and icon preloaded in `page.tsx` (hero is an inline SVG with zero network asset overhead); explicit OG caching headers in `next.config.ts`; documented TTL review vs content velocity recorded in `lighthouse.md`. OPEN: Full Lighthouse CI run on production deployment. |
| 11 | SOURCE COMPLETE; OUTSIDER GATE OPEN | `/changelog` created and aligned with actual git history (UI Uplift, Security hardening with X-Frame-Options: DENY, and `phase-problems-progress-v1`), issue feedback link, and security disclosure policy; Footer expanded with Company column, maintainer identity, and active maintenance signal; `/changelog` added to sitemap. Human outsider footer review open. |

## Risks

- Node 26 vs required 20–22: works today; pin CI to 20 before calling
  anything "verified".
- No connected browser in agent sessions: visual gates need a human or a
  screenshot pipeline (add Playwright screenshots in WP-0 if possible).
- Content velocity vs cache TTLs (search-index 3600s, dashboard 60s):
  revisit in WP-10; add `revalidateTag("search-index")` to any future
  admin write path.

## Out of scope

Online judge, contests, AI tutor, new product features. UI uplift only.
Two typefaces max. Motion must explain or orient. No fake proof, ever.
