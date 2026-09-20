"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Layers, Map, Code2 } from "lucide-react";
import type { SearchItem } from "@/lib/searchIndex";

const KIND_RANK: Record<SearchItem["kind"], number> = {
  article: 0,
  problem: 1,
  topic: 2,
  module: 3,
};

const KIND_LABEL: Record<SearchItem["kind"], string> = {
  article: "Articles",
  problem: "Problems",
  topic: "Topics",
  module: "Modules",
};

const RECENT_KEY = "dsa.recent-searches";
const MAX_RECENTS = 5;

function readRecentHrefs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENTS)
      : [];
  } catch {
    return [];
  }
}

/**
 * Command palette — ⌘K (or ctrl+K). Fuzzy-matches titles + summaries against
 * the prebuilt search index. Keyboard-navigable; Enter routes to the item.
 */
export function CommandPalette({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Lazy initializer reads storage once per mount (server-safe via the
  // window guard); refreshed on every `go()` below. No effect needed.
  const [recentHrefs, setRecentHrefs] = useState<string[]>(() =>
    readRecentHrefs(),
  );
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const listId = "cmdk-listbox";
  const optionId = (i: number) => `cmdk-opt-${i}`;

  const openPalette = () => {
    triggerRef.current = (document.activeElement as HTMLElement) || null;
    setQuery("");
    setActive(0);
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closePalette = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closePalette();
        else openPalette();
        return;
      }
      if (!open && !isEditable(e.target) && e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpen = () => openPalette();
    window.addEventListener("dsa:open-palette", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("dsa:open-palette", onOpen as EventListener);
    };
  }, [open]);

  // ⚡ BOLT: Precompute searchable strings so we don't recalculate on every keystroke.
  // This prevents main thread blocking by avoiding string concatenation/lowercasing during typing.
  const precomputedIndex = useMemo(() => {
    return index.map((item) => ({
      item,
      hay: (
        item.title +
        " " +
        ("summary" in item ? item.summary : "") +
        " " +
        ("moduleName" in item ? item.moduleName : "") +
        " " +
        ("topicName" in item ? item.topicName : "") +
        " " +
        ("difficulty" in item ? item.difficulty : "")
      ).toLowerCase(),
      titleLower: item.title.toLowerCase(),
    }));
  }, [index]);

  const { items: results, recentCount } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rank = (item: SearchItem) => KIND_RANK[item.kind];
    if (!q) {
      const base = precomputedIndex.slice(0, 24).map((x) => x.item);
      if (recentHrefs.length === 0) return { items: base, recentCount: 0 };
      // NB: `Map` here would resolve to the lucide icon imported above,
      // so the lookup is a plain record.
      const byHref: Record<string, SearchItem> = {};
      for (const x of precomputedIndex) byHref[x.item.href] = x.item;
      const inBase = new Set(base.map((x) => x.href));
      const recents: SearchItem[] = [];
      for (const href of recentHrefs) {
        const item = byHref[href];
        if (item && !inBase.has(href) && !recents.some((r) => r.href === href)) {
          recents.push(item);
        }
      }
      recents.sort((a, b) => rank(a) - rank(b));
      return { items: [...recents, ...base].slice(0, 40), recentCount: recents.length };
    }
    const tokens = q.split(/\s+/);

    // Optimization: Avoid chained array allocations (.map.filter.sort.slice)
    // to reduce memory pressure during frequent search keystrokes
    const matches: { item: SearchItem; score: number }[] = [];

    for (const { item, hay, titleLower } of precomputedIndex) {
      let score = 0;
      let isMatch = true;
      for (const t of tokens) {
        const idx = hay.indexOf(t);
        if (idx === -1) {
          isMatch = false;
          break;
        }
        score += idx === 0 ? 8 : hay.includes(" " + t) ? 4 : 1;
        if (titleLower.includes(t)) score += 5;
      }

      if (isMatch) {
        matches.push({ item, score });
      }
    }

    return {
      items: matches
        .sort((a, b) => KIND_RANK[a.item.kind] - KIND_RANK[b.item.kind] || b.score - a.score)
        .slice(0, 40)
        .map((x) => x.item),
      recentCount: 0,
    };
  }, [query, precomputedIndex, recentHrefs]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  // While open, mark every sibling of the palette inert so the background is
  // truly unavailable to pointer, Tab, and AT virtual cursors — not just
  // advertised as ignored via aria-modal. Enforces the modal contract.
  useEffect(() => {
    if (!open) return;
    const root = dialogRef.current;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== root,
    );
    const previouslyInert = siblings.map((el) => el.inert);
    for (const el of siblings) el.inert = true;
    return () => {
      siblings.forEach((el, i) => {
        el.inert = previouslyInert[i];
      });
    };
  }, [open]);

  const go = (item: SearchItem) => {
    setOpen(false);
    try {
      const prev = readRecentHrefs();
      const next = [item.href, ...prev.filter((h) => h !== item.href)].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecentHrefs(next);
    } catch {
      // Recents are a nicety; navigation must never depend on storage.
    }
    router.push(item.href);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) go(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    }
  };

  if (!open) return null;

  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={handleDialogKeyDown}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "color-mix(in srgb, var(--paper) 65%, transparent)",
          backdropFilter: "blur(2px)",
        }}
        onClick={closePalette}
      />
      <div
        className="relative w-full max-w-xl overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--rule-strong)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <Search className="h-4 w-4 text-ink-blue shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search articles, topics, modules…"
            aria-label="Search articles, topics, modules"
            className="flex-1 bg-transparent outline-none text-lead placeholder:text-muted-foreground font-display"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
          />
          <Kbd>esc</Kbd>
        </div>
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="max-h-[55vh] overflow-y-auto py-1"
        >
          {results.length === 0 ? (
            <div className="px-4 py-10 text-sm text-muted-foreground text-center font-pencil">
              No matches.
            </div>
          ) : (
            results.map((item, i) => {
              const prev: SearchItem | undefined = i > 0 ? results[i - 1] : undefined;
              const inRecents = i < recentCount;
              const showHeader =
                (inRecents && i === 0) || (!inRecents && (!prev || prev.kind !== item.kind));
              return (
                // href is the stable identity so reorders and re-filters
                // don't remount rows; the index disambiguates a hypothetical
                // duplicate href (e.g. a problem slug colliding with an
                // article slug).
                <Fragment key={`${item.kind}:${item.href}:${i}`}>
                  {showHeader && (
                    <div
                      aria-hidden
                      className="px-4 pt-2.5 pb-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {inRecents ? "Recent" : KIND_LABEL[item.kind]}
                    </div>
                  )}
                  <Row
                    item={item}
                    idx={i}
                    id={optionId(i)}
                    active={i === active}
                    onHover={() => setActive(i)}
                    onClick={() => go(item)}
                  />
                </Fragment>
              );
            })
          )}
        </div>
        <div
          className="flex items-center justify-between px-4 py-2 border-t border-rule text-caption font-mono uppercase tracking-[0.12em] text-muted-foreground"
          style={{ background: "var(--surface-2)" }}
        >
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <span className="ml-1">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd>
            <span className="ml-1">open</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘K</Kbd>
            <span className="ml-1">close</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  item,
  idx,
  id,
  active,
  onHover,
  onClick,
}: {
  item: SearchItem;
  idx: number;
  id: string;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const Icon =
    item.kind === "article"
      ? BookOpen
      : item.kind === "module"
        ? Map
        : item.kind === "problem"
          ? Code2
          : Layers;
  const kindLabel =
    item.kind === "article"
      ? "Article"
      : item.kind === "module"
        ? "Module"
        : item.kind === "problem"
          ? "Problem"
          : "Topic";

  return (
    <button
      type="button"
      role="option"
      id={id}
      data-idx={idx}
      aria-selected={active}
      onMouseEnter={onHover}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`relative w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors ${
        active
          ? "bg-ink-blue-wash text-ink"
          : "text-foreground/85"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-ink-blue"
        />
      )}
      <Icon
        className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-ink-blue" : "text-muted-foreground"}`}
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-display text-lead truncate ${active ? "text-ink-blue" : ""}`}
          >
            {item.title}
          </span>
          <span className="rounded-full border border-border px-1.5 py-px text-[11px] font-medium text-muted-foreground">
            {kindLabel}
          </span>
        </div>
        <div className="text-small text-muted-foreground mt-0.5 truncate">
          {item.kind === "article" && (
            <>
              {item.moduleName} · {item.topicName} · {item.mins}m
            </>
          )}
          {item.kind === "problem" && (
            <>
              {item.moduleName} · {item.topicName} · {item.difficulty.toLowerCase()}
            </>
          )}
          {item.kind === "topic" && <>{item.moduleName}</>}
          {item.kind === "module" && (item.description || "Module")}
        </div>
      </div>
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="px-1.5 py-px text-micro font-mono rounded border border-border"
      style={{ background: "var(--surface-1)", color: "var(--ink)" }}
    >
      {children}
    </kbd>
  );
}
