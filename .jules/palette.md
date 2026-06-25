## 2024-06-18 - Skip-to-content links for persistent sidebars
**Learning:** For desktop interfaces with persistent sidebars that precede main content in the DOM tree (like this curriculum app), keyboard-only users and screen readers are forced to tab through all sidebar navigation items before reaching the actual page content.
**Action:** Implemented a reusable skip-to-content pattern using standard Tailwind utilities (`sr-only focus:not-sr-only focus:absolute ...`) to allow immediate bypass of the sidebar to a `#main-content` anchor, keeping it invisible for pointer users while solving the A11y pain point.

## 2024-06-25 - Missing accessible focus and toggle states on interactive visual controls
**Learning:** Custom visualization controls (`VizButton` and toggle buttons in charts) often lack `aria-pressed` states and clear keyboard focus outlines, rendering interactive diagram state untrackable for screen readers and invisible to keyboard navigators.
**Action:** Implemented `aria-pressed` based on internal `active`/`on` state and added standard Tailwind focus-visible rings to custom visualization buttons to ensure learning tools are accessible to all users.
