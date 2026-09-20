"use client";

import { useEffect, useRef, useState } from "react";
import { List, X } from "lucide-react";
import type { TocItem } from "@/lib/toc";

/**
 * Track the section the reader is in via IntersectionObserver: the topmost
 * heading that has scrolled past a band near the top of the viewport.
 * Shared by `ArticleToc` (rail highlight) and `ReaderSectionLabel`
 * (running-header indicator) so both observe identically.
 */
export function useActiveSection(items: TocItem[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    // Track the topmost heading that has scrolled past a band near the top of
    // the viewport. We watch the entire band so the active state updates as
    // soon as a new section starts, not when it finishes.
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visible.set(e.target.id, e.boundingClientRect.top);
          } else {
            visible.delete(e.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the heading closest to (but above) the viewport band's top.
        const sorted = Array.from(visible.entries()).sort((a, b) => a[1] - b[1]);
        setActiveId(sorted[0][0]);
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) obs.observe(el);
    }

    return () => {
      obs.disconnect();
    };
  }, [items]);

  return activeId;
}

/**
 * Current-section label for the reader chrome bar. Renders nothing until
 * the reader scrolls past the first heading.
 */
export function ReaderSectionLabel({ items }: { items: TocItem[] }) {
  const activeId = useActiveSection(items);
  const active = items.find((item) => item.id === activeId);
  if (!active || active.id === items[0]?.id) return null;
  return (
    <span className="hidden max-w-48 truncate text-xs text-muted-foreground xl:inline">
      <span aria-hidden className="mr-1.5 text-muted-foreground/50">/</span>
      {active.text}
    </span>
  );
}

/**
 * Mobile jump-menu. Below `lg` the sticky rail is hidden, so this floating
 * button opens a bottom sheet listing the same sections. Tapping a section
 * jumps to it and closes the sheet. Hidden entirely when there are no H2s.
 */
export function ArticleTocMobile({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const activeId = useActiveSection(items);
  const active = items.find((item) => item.id === activeId);

  const closeSheet = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Lock body scroll while the sheet is open and manage focus.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    const closeBtn = dialogRef.current?.querySelector<HTMLElement>("button[aria-label='Close']");
    closeBtn?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Jump to section"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface-1 pl-4 pr-5 text-sm font-medium text-foreground shadow-[var(--shadow-pop)] transition-colors hover:border-border-hover"
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
        <span className="max-w-40 truncate">{active?.text ?? "Sections"}</span>
      </button>

      {open && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
          onKeyDown={handleDialogKeyDown}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={closeSheet}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_var(--dur-fast)_var(--ease-out)]"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface-1 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-pop)] animate-[sheetUp_var(--dur-base)_var(--ease-out)]">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-1 px-5 py-3.5">
              <span className="eyebrow">On this page</span>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close"
                className="grid h-10 w-10 min-h-[44px] min-w-[44px] place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="p-2">
              {items.map((item, i) => {
                const isActive = item.id === activeId;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={closeSheet}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm leading-snug transition-colors ${
                        isActive
                          ? "bg-ink-blue-wash font-medium text-ink-blue"
                          : "text-foreground hover:bg-surface-2"
                      }`}
                    >
                      <span className="font-mono text-micro tabular-nums text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sticky right-rail table of contents. Tracks the section the reader is in
 * via IntersectionObserver and highlights it with an inline indicator.
 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const activeId = useActiveSection(items);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-2">
      <div className="eyebrow">On this page</div>
      <ol className="space-y-0.5 border-l border-rule">
        {items.map((item, i) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative block pl-4 -ml-px py-1 text-small leading-snug border-l transition-colors ${
                  isActive
                    ? "text-ink-blue border-l-ink-blue font-medium"
                    : "text-muted-foreground border-l-transparent hover:text-ink-blue"
                }`}
              >
                <span className="font-mono text-micro text-muted-foreground mr-1.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
