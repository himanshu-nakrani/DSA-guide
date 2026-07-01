## 2024-06-18 - Skip-to-content links for persistent sidebars
**Learning:** For desktop interfaces with persistent sidebars that precede main content in the DOM tree (like this curriculum app), keyboard-only users and screen readers are forced to tab through all sidebar navigation items before reaching the actual page content.
**Action:** Implemented a reusable skip-to-content pattern using standard Tailwind utilities (`sr-only focus:not-sr-only focus:absolute ...`) to allow immediate bypass of the sidebar to a `#main-content` anchor, keeping it invisible for pointer users while solving the A11y pain point.

## 2024-06-25 - Missing accessible focus and toggle states on interactive visual controls
**Learning:** Custom visualization controls (`VizButton` and toggle buttons in charts) often lack `aria-pressed` states and clear keyboard focus outlines, rendering interactive diagram state untrackable for screen readers and invisible to keyboard navigators.
**Action:** Implemented `aria-pressed` based on internal `active`/`on` state and added standard Tailwind focus-visible rings to custom visualization buttons to ensure learning tools are accessible to all users.

## 2026-06-26 - Missing accessible group grouping and state for button toggles
**Learning:** Groups of buttons functioning as mutually exclusive choices (like problem status selection) often use visual grouping and implicit label tags that cause accessibility issues. A `<label>` tag is invalid without a form input. Also, screen readers cannot determine the selected button without an `aria-pressed` state.
**Action:** Replaced the invalid `<label>` with a `<span id="...">`, grouped the buttons in a `div` with `role="group"` and `aria-labelledby`, and added `aria-pressed={active}` to each button to properly expose the interactive state.

## 2025-02-27 - Grouping Mutually Exclusive Toggle Buttons
**Learning:** Orphaned mutually exclusive choice buttons (like toggles in the visualizations) fail to provide proper context to screen readers, making it unclear they function as a single logical input group. The `aria-pressed` state alone isn't enough context.
**Action:** Always wrap related toggle button clusters within a container using `role="group"` and an explicit `aria-label` (or `aria-labelledby`) so that screen reader users understand the relationship between the choices.

## 2024-07-01 - Missing keyboard focus on persistent layout toggles
**Learning:** The `ThemeToggle` component, when rendered in a collapsed sidebar foot, acts as an icon-only button and initially lacks `focus-visible` styles. This makes it challenging for keyboard users to perceive focus on a persistent and frequently accessed layout control.
**Action:** Added standard focus-visible styles (`outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]`) to the `ThemeToggle` button to ensure it matches the accessibility standards established by other interactive controls like `VizButton`.
## 2025-07-01 - Missing focus rings on icon-only layout controls
**Learning:** Icon-only layout controls (like sidebar collapse/expand buttons) that are removed from the natural document flow often lack explicit focus indicators, making them completely invisible to keyboard users navigating the UI.
**Action:** Always verify that standalone icon buttons have explicit `focus-visible` styles (e.g., `outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]`) to ensure keyboard accessibility.
