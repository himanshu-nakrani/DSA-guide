# UI Baseline & Visual Inventory

Baseline documentation for DSA Guide UI Uplift, tracking performance budgets, bundle sizes, accessibility metrics, and route inventories.

## Route Inventory

| Route | Purpose | Key Interactive Elements |
|---|---|---|
| `/` | Marketing landing | Dual CTA, live BFS hero figure with offscreen pause, DB statistics, FAQ accordion |
| `/learn` | Curriculum index | Module and article cards, read count tally, topic breakdown |
| `/learn/[slug]` | Long-form reader | Reading progress bar, running header label, H2 copy-links, TOC rail + mobile bottom sheet, code copy, viz players |
| `/roadmap` | Learning pathway | Sequential module nodes, "Resume" / "Review" deep-links to unread articles |
| `/problems` | Practice queue | Filter drawer / mobile disclosure, search bar, difficulty badges, status controls, problem card grid |
| `/problems/[slug]` | Problem detail | Multi-language starter code tabs, hint accordions, status selector, bookmark button, related problem cards |
| `/dashboard` | User momentum | Stat cards, weekly-goal ring, weakest area callout, activity chart, recent reads, solved milestones |
| `/lists` | Custom collections | Create list form, rename/delete dialogs, public share toggle, copy link, bulk select-move-remove |
| `/auth` | Authentication | Tabbed sign-in/registration, form validation, error alerts, unexpected error toasts |
| `/changelog` | Release notes & trust | Version timeline, contact links, security disclosure instructions |

## Screenshot Capture Spec

When generating screenshots (automated via Playwright or manual capture):
- Viewports:
  - Desktop: 1440 × 900
  - Mobile: 390 × 844 (iPhone 14 standard) and 360 × 800 (narrow Android baseline)
- Themes:
  - Light (`data-theme="light"`)
  - Dark (`data-theme="dark"`)
- Authentication States:
  - Signed-out (default public view)
  - Signed-in (dashboard active, bookmark/status sync enabled)
