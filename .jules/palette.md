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

## 2026-07-02 - Missing accessible focus states on interactive buttons
**Learning:** Several custom interactive buttons and controls (e.g., FocusMode toggle, SearchTrigger, CopyButton, and ProblemStatusControl) lacked visible `focus-visible` outlines. This creates an accessibility gap where keyboard users cannot perceive when these elements receive focus, making navigation extremely difficult and violating standard accessibility guidelines.
**Action:** Applied standard Tailwind `focus-visible` styles (e.g., `outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]`) or CSS equivalents (`outline: 1.5px solid var(--links)`) to these custom buttons to ensure consistent and clear visual focus feedback for keyboard users.

## 2025-07-03 - Missing loading indicators on auth forms
**Learning:** Auth forms are critical interaction points and submit buttons that only swap text ("Please wait...") provide insufficient visual feedback compared to standard design patterns, especially since network latency can cause these states to linger.
**Action:** When creating forms with asynchronous submission, always ensure the submit button includes a visual loading indicator (like a spinner) alongside the pending text, taking care to hide the spinner from screen readers (using `aria-hidden="true"`) to prevent redundant announcements.
## 2025-02-18 - Concurrent Forms Accessibility
**Learning:** When multiple variations of a form (e.g., sign-in and sign-up) are rendered concurrently on the same page, hardcoded IDs or nested label inputs cause accessibility collision issues for screen readers. Explicit association using `htmlFor` and `id` generated by `useId()` reliably prevents this.
**Action:** Use `useId()` to generate dynamic, collision-free prefixes for form fields, and strictly separate `<label>` and `<input>` using explicit ID binding rather than nesting.

## 2026-07-16 - [Add password visibility toggle]
**Learning:** Adding a "show password" toggle significantly improves accessibility and usability, particularly for users with cognitive or motor impairments who might struggle to type complex passwords accurately without visual feedback. Including explicit `aria-label`, `aria-pressed`, and `focus-visible` styles ensures screen readers and keyboard users can effectively navigate and interact with the toggle.
**Action:** Consistently apply password visibility toggles on authentication forms using this accessible pattern to reduce login friction and password reset requests.
## 2024-07-24 - Server Action Form Feedback
**Learning:** Next.js Server Actions executed via native HTML forms (`<form action={myAction}>`) do not provide default loading indicators. Without explicit `useFormStatus` hooks, users receive no visual feedback that their submission (like bookmarking a problem) is processing.
**Action:** Always extract submit buttons inside Server Action forms into a separate Client Component that uses `useFormStatus()` to provide immediate visual feedback (e.g., a spinner and disabled state).

## 2025-10-24 - Server Action Form Feedback for Logout
**Learning:** Next.js Server Actions executed via native HTML forms (`<form action={logoutAction}>`) do not provide default loading indicators. Without explicit `useFormStatus` hooks, users receive no visual feedback that their sign out is processing.
**Action:** Always extract submit buttons inside Server Action forms (like `LogoutButton`) into a separate Client Component that uses `useFormStatus()` to provide immediate visual feedback (e.g., a spinner and disabled state).

## 2026-08-21 - Adding loading states to Server Action forms
**Learning:** Next.js Server Actions executed via native HTML `<form action={...}>` do not provide automatic loading states. This causes a poor user experience as the user might click the submit button multiple times before the server responds, without any visual feedback.
**Action:** Always extract submit buttons for Server Action forms into a separate Client Component that uses `useFormStatus()` from `react-dom` to read the `pending` state, allowing for a disabled state and a loading spinner to provide immediate feedback to users during network requests.

## 2026-07-28 - Missing accessible state for standalone layout toggles
**Learning:** Standalone toggle buttons (like theme switchers) often rely on visual cues (like switching icons) or dynamic `aria-label` changes to indicate their state. However, dynamic labels are insufficient for conveying the toggle mechanism to screen reader users, who need to understand that the element is a two-state button.
**Action:** Always use the `aria-pressed` attribute on standalone layout toggles to properly expose their interactive state and type to assistive technologies, ensuring they are recognized as toggle buttons rather than standard action buttons.

## 2024-08-01 - Missing accessible labels on inline form inputs
**Learning:** Inline forms (like the "Create List" form, command palette, and visualization inputs) that omit visual `<label>` elements for layout purposes leave screen reader users without proper context, as `placeholder` text is not a reliable or compliant substitute for an explicit label.
**Action:** Always provide an `aria-label` (or visually hidden `<label>`) for form inputs when a visible label is omitted from the design to ensure the input's purpose is exposed to assistive technologies.

## 2025-07-29 - Missing accessible state for region expand/collapse controls
**Learning:** Controls that expand or collapse regions of the UI (like sidebar toggles) must accurately communicate the state of that region. Even when separate buttons are used for expanding and collapsing, both should use the `aria-expanded` attribute reflecting the actual state of the region. Otherwise, screen reader users miss crucial layout context.
**Action:** Always include `aria-expanded` on any toggle button that controls the visibility of a region (e.g. `aria-expanded={!collapsed}` for a sidebar toggle) so screen readers can accurately interpret the layout change.
## 2026-08-21 - aria-expanded on toggle buttons for collapsible regions
**Learning:** UI controls that toggle the visibility or layout of regions (like sidebar collapse/expand buttons) need to explicitly communicate the state of that region to assistive technologies. Using `aria-expanded` combined with `aria-controls` achieves this by linking the toggle to the region and conveying whether the region is currently expanded or collapsed.
**Action:** Always use the `aria-expanded` attribute on buttons that expand or collapse regions, and explicitly associate them with the region using `aria-controls`. This applies even when separate buttons handle the expanding and collapsing actions.

## 2026-10-25 - Using aria-haspopup="dialog" for palette triggers
**Learning:** Buttons that trigger global dialogs like search command palettes (e.g. `CommandPalette`) should explicitly convey their interaction model to assistive technologies. Without `aria-haspopup="dialog"`, screen readers may announce them as standard buttons or navigation links, leaving users unprepared for a modal dialog overlay that intercepts focus.
**Action:** Always add `aria-haspopup="dialog"` to buttons that trigger complex overlay patterns like command palettes, search modals, or site-wide menus, ensuring users anticipate the modal interaction before activating the control.
