# Automated axe-core Accessibility Audit Report

Executed via headless Chromium (`@axe-core` 4.10.2 / WCAG 2.1 AA ruleset) across primary route surfaces in both Light (`data-theme="light"`) and Dark (`data-theme="dark"`) themes.

## Summary of Results

| Route Tested | Light Theme Violations | Dark Theme Violations | Passes Recorded | Status |
|---|---|---|---|---|
| **Home (`/`)** | **0** | **0** | 41 rules passed | PASS |
| **Learn Index (`/learn`)** | **0** | **0** | 38 rules passed | PASS |
| **Article Reader (`/learn/two-pointers`)** | **0** | **0** | 42 rules passed | PASS |
| **Roadmap (`/roadmap`)** | **0** | **0** | 39 rules passed | PASS |
| **Problems Queue (`/problems`)** | **0** | **0** | 41 rules passed | PASS |
| **Auth (`/auth`)** | **0** | **0** | 45 rules passed | PASS |
| **Changelog (`/changelog`)** | **0** | **0** | 37 rules passed | PASS |

*Full machine-readable run results committed to `docs/ui-baseline/axe-results.json`.*

---

## Remediation Performed to Reach Zero Violations

1. **Problems Queue Selects:**
   - Added explicit `aria-label="Filter by problem status"` and `aria-label="Sort problems by"` to eliminate `select-name` and `label-title-only` violations.
2. **Reader Landmark Uniqueness:**
   - Distinct `aria-label="Breadcrumb"` added to the reader top bar `<nav>` so assistive technology can differentiate it from primary header and TOC navigation landmarks.
3. **Visualization & Reading Contrast:**
   - Corrected active two-pointers visualization styling to ensure foreground text contrasts against soft fills.
   - Removed opacity dampening on reading chip indicators in `ReadingChip.tsx`.
   - Corrected TOC section number styling in `ArticleToc.tsx` to use full contrast `--muted-foreground`.
4. **Token Calibration:**
   - Light `--pencil` and `--code-comment` calibrated to `hsl(240, 5%, 44%)` ($5.13:1$ contrast against `--bg` `hsl(0, 0%, 99%)`, $4.62:1$ against `--code-bg` `hsl(240, 5%, 94.5%)`, and $5.26:1$ against `--pre-bg` `#ffffff`).
   - Dark `--code-comment` elevated to `hsl(240, 4%, 56%)` ($5.23:1$ contrast against `--pre-bg` `hsl(240, 6%, 9.5%)`).
