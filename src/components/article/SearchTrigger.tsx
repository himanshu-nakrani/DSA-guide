"use client";

import { Search } from "lucide-react";

/**
 * Small search affordance dropped into the article running header so a
 * reader on mobile (where the sidebar collapses to a top strip) doesn't
 * have to scroll back up to reach search. Dispatches the same event the
 * sidebar search button does, so the CommandPalette opens.
 */
export function SearchTrigger() {
  return (
    <button
      type="button"
      title="Search (⌘K)"
      aria-label="Open search"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new CustomEvent("dsa:open-palette"))}
      className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-note font-mono uppercase tracking-[0.06em] text-muted-foreground hover:text-ink-blue transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]"
    >
      <Search className="h-3 w-3" strokeWidth={1.5} />
      <span className="hidden sm:inline">Search</span>
      <kbd className="ml-1 px-1.5 py-0.5 rounded border border-border bg-surface-2 text-micro">
        ⌘K
      </kbd>
    </button>
  );
}
