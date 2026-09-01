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
      className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-[0.06em] text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
    >
      <Search className="h-3 w-3" strokeWidth={1.5} />
      <span className="hidden sm:inline">Search</span>
      <kbd className="ml-1 px-1.5 py-0.5 rounded-[2px] border border-[color:var(--rule)] bg-[color:var(--surface-2)] text-[0.6rem]">
        ⌘K
      </kbd>
    </button>
  );
}
