# Visualization authoring guide

Interactive figures in DSA Guide are authored as React components and embedded in Markdown with fenced `viz` blocks. Every figure should make one algorithmic invariant visible, expose a deterministic step model, and remain understandable without animation.

## 1. Choose a single learning objective

Before writing code, state the invariant or decision the learner should be able to explain after the trace. Good objectives are concrete: “reject an edge when both endpoints share a DSU representative” or “move `hi` to `mid` while preserving the half-open interval.” Avoid combining unrelated algorithms in one figure.

## 2. Add the component through the registry

Create the component under `src/components/viz/`, export its React component, and export a pure frame-builder when the visualization has a deterministic trace. Register it in `src/components/viz/Viz.tsx` with `React.lazy` so the lesson does not pay for every figure on first load.

Use the shared primitives from `_chrome.tsx`:

```tsx
import { PALETTE, VizButton, VizFrame } from "./_chrome";
```

Wrap the figure in `VizFrame`, place controls in its `controls` prop, and use `VizButton` for reset, previous, next, finish, variant, and play/pause controls.

## 3. Make the frame model deterministic

A frame should contain enough state to render the entire figure without reading mutable history. Keep the frame builder pure: clone arrays and objects before storing them, use stable tie-breaking for equal-priority choices, and include a final completion frame. Prefer explicit action names such as `consider`, `accept`, `reject`, `pop`, `relax`, or `stale` over implicit booleans.

The component should clamp the current step when inputs change and disable controls at the ends of the trace. Add regression tests for the normal path, the key invariant transition, malformed or boundary inputs, and the final answer.

## 4. Accessibility requirements

Every figure needs a meaningful `aria-label` on its outer section or `VizFrame`. The controls group is labeled by the shared frame. Symbol-only buttons must provide an explicit `ariaLabel`; visible text alone is sufficient for text controls. Use `aria-live="polite"` for the current explanation, and label tables with either `aria-label` or a visible/captioned table heading. SVG diagrams require `role="img"` and a concise `aria-label`.

Do not use color as the only signal. Pair states with text such as “accepted,” “rejected,” “current,” or “stale.” Preserve visible focus rings, use native buttons, and keep all controls keyboard reachable.

## 5. Responsive behavior

The shared frame content is horizontally scrollable for genuinely wide tables or diagrams, but the page itself must not overflow. Use `min-w-0` on grid children, `overflow-x-auto` around wide tables, and responsive cell sizes for editable grids. Controls must wrap at narrow widths. Validate at 390 × 844 as well as a desktop viewport.

## 6. Content embedding

Add a JSON block to the relevant article:

````markdown
```viz
{ "type": "example-type", "props": { "caption": "Short descriptive caption" } }
```
````

Keep props small and serializable. Add a validator branch in `scripts/validate-content.ts` for every new type, including finite-number, length, enum, and structural limits. The validator should reject malformed data before a lesson reaches production.

## 7. Required checks before opening a PR

Run the full project gates:

```bash
npm run verify
DATABASE_URL="postgresql://..." npm run build
npm audit --omit=dev --audit-level=high
```

For browser smoke testing, load a representative lesson in production mode, resize to 390 × 844, verify that `document.documentElement.scrollWidth` equals `clientWidth`, inspect the accessible names of visible controls, step through the key invariant frame, and check the browser console for errors. Record any browser-specific limitation in the PR description.

## 8. Review checklist

| Area | Required evidence |
| --- | --- |
| Learning objective | One invariant or decision is stated in the article and caption |
| Frame model | Pure builder, stable ordering, final frame, boundary tests |
| Accessibility | Named group, labeled controls, live explanation, semantic table/SVG |
| Responsive layout | No document overflow at 390 px; wide content scrolls locally |
| Content contract | Validator entry and valid Markdown `viz` block |
| Quality gates | Verify, production build, audit, and browser smoke results |
