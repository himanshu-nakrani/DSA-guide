# Design System — Quiet Paper

Single source of truth for DSA Guide UI. If a new surface disagrees with
this doc, change the surface, not the doc.

## Principles

- One neutral palette + one accent. Color means something: blue = links,
  active, progress; green = complete; red = danger/errors; ochre = current
  step in figures.
- Two typefaces: sans (UI + prose) and mono (code, data, micro-labels).
- Whitespace over ornament. No shadows above `--shadow-pop`, no new radii.

## Tokens (`src/app/globals.css`)

| Token group | Values |
|---|---|
| Surfaces | `--bg` page, `--surface-1` cards, `--surface-2` sunken |
| Text | `--fg` body, `--title-color` headings, `--pencil` muted |
| Lines | `--border`, `--border-hover` |
| Accent + status | `--links`, `--ink-green`, `--ink-red`, `--ink-ochre` (+ `-wash` fills) |
| Radius | `sm` 4px (focus details), `md` 8px (buttons, inputs, cards), `lg` 12px (large cards) |
| Motion | `--dur-fast` 150ms, `--dur-base` 200ms, `--ease-out`; stagger/bloom removed |
| Type scale (chrome) | `micro`/`caption`/`note` mono labels; `small`/`body` UI copy; `lead`/`title` emphasis |

Dark mode is a full token swap under `[data-theme="dark"]` — never hardcode
a hex in a component; always use a token utility.

## Components

| Component | File | Notes |
|---|---|---|
| Button | `ui/button.tsx` | `ink`/`ghost`/`subtle`/`chip`; `md`/`sm`/`icon`. Radius 8px. |
| Field | `.field` in `globals.css` | All text inputs/selects. Focus = accent border + 18% ring. `.field-pad-left/right` for icon adornments. |
| Pill | `.pill` in `globals.css` | Sentence case, `rounded-full`, `bg-surface-2`. `.pill-primary`/`.pill-red` for status. |
| Card | `.surface-card` | 8px radius, hairline border, `--shadow-card`. Hover lift: `hover:border-border-hover hover:shadow-[var(--shadow-pop)]`. |
| Tabs | `ui/tabs.tsx` + `ui/content-tabs.tsx` | Mono chips for in-page switching; underline style for workspaces. |
| Dialog | `ui/dialog.tsx` | Backdrop + popup + title/description primitives; `ConfirmDialog` pattern lives in `lists/ListActions.tsx`. |
| Toast | `ui/toast.tsx` | `toast(msg, { tone, key, durationMs })`; `<Toaster/>` mounted in layout. Max 3, keyed replace, 4s/6s dismiss. |
| Skeleton | `ui/skeleton.tsx` | Geometry must match the final card it stands in for. |
| Header | `layout/Header.tsx` | Sticky, blur, active underline, avatar menu, `⌘K` search trigger. |
| Command palette | `layout/CommandPalette.tsx` | `⌘K`/`/`, grouped results, stable `href` keys. |
| Viz frame | `viz/_chrome.tsx` | `PALETTE` semantics: c1 active, c2 secondary, c3 current step, c4 danger, c5 inert. |

## Patterns

- Page scaffold: `PageShell` (widths `narrow` 2xl / `default` 4xl / `wide` 6xl,
  gutters `px-4 sm:px-6`) + `PageHeader` (12px eyebrow, tight 4xl/5xl title).
- Mutations: optimistic where trivial (status selects), else pending state +
  success toast + error toast with rollback. Never silent, never
  `window.confirm`.
- Eyebrow: sans semibold 12px uppercase for section labels (`.eyebrow`).
- Progress bars: `h-1.5 rounded-full bg-border`, fill `bg-ink-blue`.
- Links in prose: accent; links in chrome: foreground with accent on hover.
- Focus: visible ring everywhere (`:focus-visible`); custom controls keep
  their own ring (see `.field`).

## Do / don't

- Do use token utilities (`text-muted-foreground`, `border-border`,
  `bg-surface-2`). Don't invent one-off hexes or radii.
- Do keep touch targets ≥44px. Don't add uppercase mono labels outside
  data displays and eyebrows.
- Do check every change in dark mode. Don't add motion without a
  reduced-motion path.
