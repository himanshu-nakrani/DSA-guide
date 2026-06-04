"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Layers, Map } from "lucide-react";
import type { SearchItem } from "@/lib/searchIndex";

/**
 * Command palette — ⌘K (or ctrl+K). Fuzzy-matches titles + summaries against
 * the prebuilt search index. Keyboard-navigable; Enter routes to the item.
 */
export function CommandPalette({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open && !isEditable(e.target) && e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener("dsa:open-palette", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("dsa:open-palette", onOpen as EventListener);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 24);
    const tokens = q.split(/\s+/);
    const scored = index
      .map((item) => {
        const hay = (
          item.title +
          " " +
          ("summary" in item ? item.summary : "") +
          " " +
          ("moduleName" in item ? item.moduleName : "") +
          " " +
          ("topicName" in item ? item.topicName : "")
        ).toLowerCase();
        let score = 0;
        for (const t of tokens) {
          const idx = hay.indexOf(t);
          if (idx === -1) return null;
          score += idx === 0 ? 8 : hay.includes(" " + t) ? 4 : 1;
          if (item.title.toLowerCase().includes(t)) score += 5;
        }
        return { item, score };
      })
      .filter((x): x is { item: SearchItem; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((x) => x.item);
    return scored;
  }, [query, index]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: SearchItem) => {
    setOpen(false);
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
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-xl surface-card !p-0 overflow-hidden"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search articles, topics, modules…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="text-[0.6rem] font-mono uppercase tracking-[0.06em] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            esc
          </kbd>
        </div>
        <div
          ref={listRef}
          role="listbox"
          className="max-h-[55vh] overflow-y-auto py-1"
        >
          {results.length === 0 ? (
            <div className="px-4 py-10 text-sm text-muted-foreground text-center">
              No matches.
            </div>
          ) : (
            results.map((item, i) => (
              <Row
                key={`${item.kind}-${item.href}-${item.title}-${i}`}
                item={item}
                idx={i}
                active={i === active}
                onHover={() => setActive(i)}
                onClick={() => go(item)}
              />
            ))
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-[color:var(--surface-1,var(--card))] text-[0.65rem] font-mono uppercase tracking-[0.06em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate
          </span>
          <span className="flex items-center gap-2">
            <Kbd>↵</Kbd> open
          </span>
          <span className="flex items-center gap-2">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  item,
  idx,
  active,
  onHover,
  onClick,
}: {
  item: SearchItem;
  idx: number;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const Icon = item.kind === "article" ? BookOpen : item.kind === "module" ? Map : Layers;
  const kindLabel =
    item.kind === "article" ? "Article" : item.kind === "module" ? "Module" : "Topic";

  return (
    <button
      type="button"
      role="option"
      data-idx={idx}
      aria-selected={active}
      onMouseEnter={onHover}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors ${
        active ? "bg-accent text-foreground" : "text-foreground/85"
      }`}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{item.title}</span>
          <span className="text-[0.6rem] font-mono uppercase tracking-[0.06em] text-muted-foreground">
            {kindLabel}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {item.kind === "article" && (
            <>
              {item.moduleName} · {item.topicName} · {item.mins}m
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
    <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[0.6rem]">
      {children}
    </kbd>
  );
}
