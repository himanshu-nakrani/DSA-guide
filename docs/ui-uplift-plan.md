# UI Uplift Plan — YC Startup Grade

Goal: take DSA Guide from "clean docs site" to a product that looks funded:
distinctive brand, marketing-grade landing, cohesive system, delightful
interactions, excellent mobile + dark mode, and measurable quality bars.

Status: draft. Each phase ends with a gate. Do phases in order; do not skip
ahead. Report honestly at every gate.

How to read effort: S = ~1 session, M = ~2–4 sessions, L = ~a week.

---

## Phase 0 — Baseline (S)

Before changing anything, make quality measurable.

1. Screenshot inventory: `/`, `/learn`, one article, `/roadmap`, `/problems`,
   `/problems/[slug]`, `/dashboard` (signed in + out), `/auth`, `/lists` —
   light + dark, desktop 1440 + mobile 390.
2. Lighthouse (mobile + desktop) on `/`, `/learn`, one article: record LCP,
   INP, CLS, accessibility, best-practices.
3. `next build` bundle report: record first-load JS per route.
4. Contrast spot-check: muted text on card, pills, code comments, chart
   colors — light + dark.

Gate: baseline numbers + screenshots saved under `docs/ui-baseline/`;
`npm run build` green.

---

## Phase 1 — Brand identity (M)

The product currently ships a placeholder "D" mark
(`src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`).
YC-grade starts with an identity reviewable on its own.

1. Wordmark + mark: one geometric mark (graph-node / brackets motif),
   usable at 16px favicon through OG size. Replace both header/footer marks.
2. Favicon + `icon`/`apple-icon` routes; per-article OG already exists
   (`src/app/**/opengraph-image.tsx`) — restyle to the new identity.
3. Voice pass: replace leftover metaphors ("manuscript", "folio", "essays",
   "presses are still warm") with product voice. Grep: `manuscript|folio|
   essay|presses|colophon`.
4. Type pairing lock: confirm sans + mono only; remove dead
   `--title-font`/serif references and the unused `Fraunces`/`IBMPlexSerif`
   font files in `public/fonts/`.

Gate: new mark renders in header, footer, favicon tab, and one OG image;
zero `manuscript|folio|essay` matches in `src/`.

---

## Phase 2 — Design system v2 (L)

Promote the ad-hoc tokens into a documented system so every surface
converges instead of drifting.

1. Token audit of `src/app/globals.css`: one radius scale in use (kill
   `rounded-sm`/`rounded-[2px]` leftovers), one shadow scale, one focus-ring
   recipe (extend `.field`'s ring to all interactive elements), spacing
   rhythm (4/8/16/24/32).
2. Component inventory: `button`, `field`, `pill`, `card` (`surface-card`),
   tabs, dialog/palette, skeletons, toasts (new — see Phase 4), empty
   states, progress bars. One variant set each; delete one-off styles.
3. New `src/components/ui/toast.tsx` (or lightweight store + region):
   success/error/info, used by every mutation.
4. Kill `window.confirm` in `src/components/lists/ListActions.tsx` —
   replace with a confirm dialog.
5. System doc: `docs/design-system.md` with tokens, components, do/don'ts.
   (No Storybook dependency; a `/design` dev-only route is acceptable.)

Gate: `docs/design-system.md` exists; no `rounded-[2px]`/`rounded-sm` in
`src/` outside dead `Sidebar`/`MobileDrawer`; every user mutation toasts.

---

## Phase 3 — Marketing landing (L, highest visible impact)

`/` is currently a product index. Split: `/` sells, `/learn` teaches.

1. New `/`: hero (headline, sub, dual CTA, product visual — live viz figure
   in a browser-chrome frame, not a plain card), stat strip, "how it works"
   (Learn → Practice → Revise), curriculum preview (reuse module cards),
   testimonial/quotes section (only real quotes; empty state = omit),
   FAQ, final CTA, expanded footer (product/company/resources columns).
2. Keep `/learn` as the library start; CTAs route there.
3. SEO pass: metadata per route, sitemap (exists — verify), canonical URLs,
   JSON-LD (`Course`/`ItemList`) on landing + learn index.

Gate: landing reads convincingly in 10 seconds (5-second test with one
outsider); Lighthouse SEO 100; no fake numbers or testimonials.

---

## Phase 4 — App shell (M)

1. Header: scroll-aware border/shadow, active-section underline (exists —
   verify contrast), user menu (avatar → Dashboard, Lists, Sign out)
   replacing the bare avatar link; mobile menu collapses Lists/Dashboard
   into "More".
2. Global toast region in `src/app/layout.tsx`.
3. Command palette: recent-searches section, footer hints (exist), result
   grouping headers (Articles / Problems / Topics), `esc` + `/` + `⌘K`
   discoverability (hint in header search button — exists).
4. Breadcrumbs on `/problems/[slug]`, `/lists` detail, `/dashboard`
   (article pages have them — extend the pattern).
5. Delete dead `Sidebar.tsx` + `MobileDrawer.tsx` + `dsa-sidebar` CSS.

Gate: every route reachable in ≤2 clicks from header/palette; sign-out
works from the user menu; toasts fire on bookmark/status/list actions.

---

## Phase 5 — Surface upgrades (L, route by route)

- **Reader** (`learn/[slug]`): progress bar + chapter indicator; prev/next
  cards (done); "copy link to section" on H2 hover (anchor exists);
  print stylesheet already good — verify.
- **Roadmap**: module cards (done); add "resume" deep-link to first unread
  article per module (data exists via `readSlugSet`).
- **Problems**: filter panel (done); problem detail — starter-code copy
  buttons per tab, difficulty/maturity header summary, related-problem
  thumbnails (exist as cards — verify spacing on mobile).
- **Dashboard**: stat cards (done); add weekly-goal ring and weak-topic
  callout (data exists: `moduleCompletion`, `statusBuckets`).
- **Auth**: centered single-column card with brand mark, benefits list,
  error states (exist); add password rules hint + OAuth buttons as
  disabled "soon" (only if on the roadmap — else omit).
- **Lists**: bulk actions (move/remove), public-share link UI.

Gate per surface: mobile 390 screenshot reviewed; empty + error + loading
states all render (force each).

---

## Phase 6 — Motion & delight (M)

Tasteful only. No confetti.

1. Route transition: subtle fade/slide via `ViewTransition` (titles done —
   extend to card grids).
2. Optimistic UI: bookmark toggles, status selects, list mutations update
   instantly with toast + rollback on failure.
3. Streak/milestone moments: first-solve and 7-day-streak acknowledgment
   inline (dashboard), not modals.
4. Skeletons match final geometry on every route (learn added; audit the
   rest against `*loading.tsx`).
5. Hero figure: pause offscreen (`IntersectionObserver`), respect
   reduced-motion (done via `usePrefersReducedMotion` — verify).

Gate: all mutations feel instant on throttled 4G; zero layout shift on
filter/search navigations (measure CLS).

---

## Phase 7 — Mobile excellence (M)

1. Header: two-row height audit (64px + subnav) — collapse subnav into the
   "More" menu on scroll if it crowds article reading.
2. Reader: TOC becomes a bottom-sheet or jump-menu (currently hidden on
   mobile); tables scroll (done); code blocks don't overflow (verify with
   longest lines); viz figures touch-friendly (min 44px targets — audit).
3. Problems grid → single column (done); filters collapse into a
   disclosure on mobile.
4. Tap targets ≥44px everywhere; test on a real device, not just DevTools.

Gate: full learn→read→practice flow completable one-handed on a phone;
no horizontal overflow on any route at 360px.

---

## Phase 8 — Dark mode excellence (S–M)

1. Contrast audit of every muted/foreground pair in both themes
   (automated: axe-core on both).
2. Code theme: highlight.js colors tuned per theme (exists — verify string/
   comment contrast in dark).
3. Charts/viz: `PALETTE` already var-driven — screenshot every viz type in
   dark, fix stragglers.
4. Theme toggle: respect OS on first visit (done), no flash (done — verify
   after header change).

Gate: axe contrast violations = 0 in both themes; viz gallery screenshot
review passes.

---

## Phase 9 — Accessibility (M, parallelizable with 7–8)

1. Keyboard map documented (`?` shortcut overlay a plus, not required):
   `/`, `⌘K`, `f`, `esc` all discoverable.
2. Palette + dialogs: focus trap + return focus (audit current).
3. Live regions for toasts, progress updates, filter result counts.
4. Reduced-motion: animations, smooth scroll, tickers all gated (mostly
   done — verify comprehensively).
5. Screen-reader pass on reader + problems detail + dashboard.

Gate: axe clean; full flow completable keyboard-only; NVDA/VoiceOver
spot-check notes recorded.

---

## Phase 10 — Performance budgets (M)

1. Budgets: first-load JS ≤180KB home, ≤220KB article; LCP ≤2.5s 4G;
   INP ≤200ms. Enforce via `next build` output review at each gate.
2. Fonts: subset `iA Writer` + `Lilex` to latin; `display: swap` (done).
3. Viz: per-type `React.lazy` (done); preload the hero figure only.
4. Images/OG: `opengraph-image` routes cached; no unoptimized `<img>`
   (verified: none).
5. Caching: search index cached (done); dashboard 60s (done); learn/
   roadmap 3600s (done) — revisit TTLs against content velocity.

Gate: budgets met on mobile Lighthouse for `/`, `/learn`, one article;
bundle report attached to the gate note.

---

## Phase 11 — Trust & growth (S–M, last)

Testimonials (real only), changelog (`/changelog` from git tags or manual),
docs link, GitHub link, contact/security page, status page link if any.
RSS exists — surface it in the footer (done).

Gate: footer answers "who builds this, is it alive, how do I contact them".

---

## Non-goals (do not start)

- New product features (judge, contests, AI tutor) — UI uplift only.
- Rebrand every quarter; two typefaces max, forever.
- Animation for its own sake; every motion must explain or orient.
- Fake social proof, fake counts, fake urgency.

## Definition of done (whole plan)

- Baselines beaten: Lighthouse ≥95 across the board on the three key
  routes; axe clean light + dark; budgets met.
- Screenshot inventory redone and visibly transformed.
- One outsider completes learn→read→practice on mobile, unaided.
- `docs/design-system.md` + this plan marked complete with gate notes.
