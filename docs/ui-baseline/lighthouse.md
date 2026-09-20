# UI Baseline, Bundle, Contrast & Verification Report

## 1. Grounded Contrast Measurements (WCAG AA Compliance)

Ratios computed mathematically from relative luminance formulas ($L = 0.2126R + 0.7152G + 0.0722B$) using exact sRGB color coordinates converted from `src/app/globals.css` tokens:

| Theme | Token / Element | Color Token Value | Background Token | Background RGB | Contrast Ratio | WCAG AA Status ($\ge 4.5:1$) |
|---|---|---|---|---|---|---|
| **Light** | Body text (`--fg`) | `hsl(240, 6%, 26%)` | `--bg` (`hsl(0, 0%, 99%)`) | `(252, 252, 252)` | **10.33:1** | PASS |
| **Light** | Muted captions / meta (`--pencil`) | `hsl(240, 5%, 44%)` | `--bg` (`hsl(0, 0%, 99%)`) | `(252, 252, 252)` | **5.13:1** | PASS (calibrated from earlier 58% lightness) |
| **Light** | Interactive links (`--links`) | `hsl(221, 70%, 45%)` | `--bg` (`hsl(0, 0%, 99%)`) | `(252, 252, 252)` | **6.49:1** | PASS |
| **Light** | Inline code comments (`--code-comment`) | `hsl(240, 5%, 44%)` | `--code-bg` (`hsl(240, 5%, 94.5%)`) | `(240, 240, 242)` | **4.62:1** | PASS |
| **Light** | Pre-block code comments (`--code-comment`) | `hsl(240, 5%, 44%)` | `--pre-bg` (`#ffffff`) | `(255, 255, 255)` | **5.26:1** | PASS |
| **Dark** | Body text (`--fg`) | `hsl(240, 5%, 78%)` | `--bg` (`hsl(240, 6%, 8%)`) | `(19, 19, 22)` | **10.68:1** | PASS |
| **Dark** | Headings (`--title-color`) | `hsl(0, 0%, 96%)` | `--bg` (`hsl(240, 6%, 8%)`) | `(19, 19, 22)` | **17.01:1** | PASS |
| **Dark** | Pre-block code comments (`--code-comment`) | `hsl(240, 4%, 56%)` | `--pre-bg` (`hsl(240, 6%, 9.5%)`) | `(23, 23, 26)` | **5.23:1** | PASS (elevated from earlier 48% lightness) |
| **Dark** | Syntax keywords (`--code-keyword`) | `hsl(221, 80%, 72%)` | `--pre-bg` (`hsl(240, 6%, 9.5%)`) | `(23, 23, 26)` | **7.15:1** | PASS |

---

## 2. Grounded Production Bundle & Font Analysis

### Production JS Footprint
Measured directly from `.next/static` output produced by `next build` (Next.js 16.3 / Turbopack):
- **Total Static JS Assets:** 101 chunk files
- **Total Combined JS Footprint:** 2,133 KB (uncompressed across all route chunks and shared dependencies)
- **Primary Shared Vendor Chunks:**
  - React / Base UI runtime chunk: ~584 KB
  - Lucide icon / utility bundle: ~224 KB
  - Visualization & shared math rendering: ~160 KB
  - Layout & navigation shell: ~110 KB

### Font Subsetting (Latin Charset)
Fonts subsetted using `pyftsubset` (`fontTools` + `brotli`) to Latin/Extended Latin ranges (`U+0000-007F,U+00A0-00FF,U+0100-017F,U+2000-206F,U+2070-209F,U+20A0-20CF,U+2100-214F,U+2190-21BB`):
- `public/fonts/iAWriterQuattroV.woff2`: 50.3 KB $\rightarrow$ **23.8 KB** ($-52.7\%$)
- `public/fonts/iAWriterQuattroV-Italic.woff2`: 48.9 KB $\rightarrow$ **27.4 KB** ($-43.9\%$)
- `public/fonts/Lilex-Regular.woff2`: 63.1 KB $\rightarrow$ **33.0 KB** ($-47.7\%$)
- **Total font weight reduced by ~50% across the application.**

### Critical Resource Preloads
- In `src/app/page.tsx`: Added explicit `<link rel="preload">` tags for the primary Latin font (`/fonts/iAWriterQuattroV.woff2`) and the brand identity mark (`/icon.svg`).
- The hero visualization itself (`BFSHero`) is an inline SVG component; it requires zero network image requests.

---

## 3. Server Response, Cache Headers & TTL Review

### Documented Cache TTL Review vs Content Velocity

| Cache Scope | TTL Configured | Content Velocity | Evaluation & Strategy |
|---|---|---|---|
| **Global Search Index** | 3,600s (1 hr) | Low (curriculum changes on release) | Safe. Revalidation occurs hourly; admin write path should issue `revalidateTag("search-index")` when publishing. |
| **User Dashboard** | 60s (1 min) | High (user solves/reads) | Fast repeated navigation; server mutations (`progress`, `lists`) call `revalidatePath` directly on mutation for instant client updates. |
| **Curriculum & Roadmap** | 3,600s (1 hr) | Low (editorial batch updates) | High cache hit rate for readers. |
| **RSS Feed** | 3,600s (1 hr) | Low | Standard feed polling rhythm. |
| **Sitemap** | 86,400s (24 hr) | Daily | Daily crawler indexing rate. |
| **OG Images** | 86,400s (24 hr) | Static per slug | Explicitly configured in `next.config.ts`: `public, max-age=86400, s-maxage=86400`. |

---

## 4. Automated axe-core Accessibility Audit

Executed via headless Chromium (`@axe-core` 4.10.2 / WCAG 2.1 AA ruleset) across 7 primary route surfaces in both Light and Dark themes.

**Result: 0 violations across all 7 routes in both Light and Dark themes.**
Pass counts directly match the recorded machine-readable output in `docs/ui-baseline/axe-results.json`:
- Home (`/`): **0 violations** (41 rules passed)
- Learn (`/learn`): **0 violations** (38 rules passed)
- Article Reader (`/learn/two-pointers`): **0 violations** (42 rules passed)
- Roadmap (`/roadmap`): **0 violations** (39 rules passed)
- Problems (`/problems`): **0 violations** (41 rules passed)
- Auth (`/auth`): **0 violations** (45 rules passed)
- Changelog (`/changelog`): **0 violations** (37 rules passed)

---

## 5. Captured Screenshot Inventory

All screenshots captured live via Chromium headless automation (`browser` runner) and saved in `docs/ui-baseline/screenshots/`:

### Standard Route Surfaces (40 screenshots)
Captured at Desktop ($1440 \times 900$) and Mobile ($390 \times 844$) in Light and Dark themes:
- `/` (Home)
- `/learn` (Learn index)
- `/learn/two-pointers` (Reader)
- `/roadmap` (Roadmap)
- `/problems` (Problems queue)
- `/problems/two-sum` (Problem detail)
- `/dashboard` (Dashboard signed-out)
- `/auth` (Auth card)
- `/lists` (Lists)
- `/changelog` (Changelog & Trust)

### Authenticated Surface Screenshots (4 screenshots)
- `dashboard-authenticated-desktop-light.png`
- `dashboard-authenticated-desktop-dark.png`
- `dashboard-authenticated-mobile-390-light.png`
- `dashboard-authenticated-mobile-390-dark.png`

### Forced State Screenshots (6 screenshots)
- Forced 404: `forced-404-desktop-light.png`, `forced-404-desktop-dark.png`, `forced-404-mobile-390-dark.png`
- Forced Skeletons: `forced-loading-learn-desktop.png`, `forced-loading-problems-desktop.png`, `forced-loading-mobile-390.png`

### Dark Visualization Gallery (`docs/ui-baseline/screenshots/viz-gallery/`)
Captured all **35 registered visualization types** in `src/components/viz/Viz.tsx` plus the BFS graph hero (36 captures):
1. `bfs-hero-dark.png`
2. `complexity-chart-dark.png`
3. `growth-table-dark.png`
4. `array-memory-dark.png`
5. `binary-search-dark.png`
6. `binary-search-invariant-dark.png`
7. `linear-vs-binary-dark.png`
8. `two-pointers-dark.png`
9. `sliding-window-dark.png`
10. `hash-table-dark.png`
11. `linked-list-dark.png`
12. `stack-queue-dark.png`
13. `tree-traversal-dark.png`
14. `graph-traversal-dark.png`
15. `dp-grid-dark.png`
16. `dijkstra-dark.png`
17. `dijkstra-lazy-heap-dark.png`
18. `recursion-tree-dark.png`
19. `architecture-dark.png`
20. `invariant-trace-dark.png`
21. `knowledge-check-dark.png`
22. `proof-builder-dark.png`
23. `tree-dp-dark.png`
24. `dag-scheduler-dark.png`
25. `bellman-ford-pass-dark.png`
26. `dp-decision-trace-dark.png`
27. `edit-path-reconstructor-dark.png`
28. `zero-one-deque-dark.png`
29. `unique-paths-grid-dark.png`
30. `rolling-buffer-trace-dark.png`
31. `rerooting-propagation-dark.png`
32. `heap-operation-trace-dark.png`
33. `dsu-forest-trace-dark.png`
34. `kruskal-mst-trace-dark.png`
35. `monotonic-deque-window-dark.png`
36. `next-greater-stack-dark.png`

---

## 6. Open Verification Gates (Awaiting Production / Human Audit)

The following gates are explicitly noted as open and cannot be closed by local static automation:
1. **Production Lighthouse CI Run:** Measuring live LCP ($\le 2.5\text{s}$ on 4G), INP ($\le 200\text{ms}$), CLS ($\approx 0$), and Lighthouse SEO 100 on a deployed URL.
2. **Per-route first-load JS budget:** Current Next.js Turbopack compiler does not output route-specific split tables; requires production bundle analyzer output.
3. **5-second outsider test** (`/`): Requires an independent human evaluator.
4. **Physical real-device one-handed 360px test**: Automated viewport emulation shows zero horizontal overflow, but physical thumb-reach assessment requires real device testing.
5. **Qualitative VoiceOver / NVDA screen reader pass**: Assistive technology end-to-end user evaluation.
6. **Outsider footer test**: Qualitative trust impression assessment.
