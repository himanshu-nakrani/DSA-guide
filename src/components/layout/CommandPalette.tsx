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
  const listId = "cmdk-listbox";
  const optionId = (i: number) => `cmdk-opt-${i}`;

  const openPalette = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
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
        if (open) setOpen(false);
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
        className="absolute inset-0"
        style={{
          background:
            "color-mix(in srgb, var(--paper) 65%, transparent)",
          backdropFilter: "blur(2px)",
        }}
        onClick={() => setOpen(false)}
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
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--rule)]">
          <Search className="h-4 w-4 text-[color:var(--ink-blue)] shrink-0" strokeWidth={1.5} />
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
            className="flex-1 bg-transparent outline-none text-[0.95rem] placeholder:text-muted-foreground font-display"
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
            results.map((item, i) => (
              <Row
                key={`${item.kind}-${item.href}-${item.title}-${i}`}
                item={item}
                idx={i}
                id={optionId(i)}
                active={i === active}
                onHover={() => setActive(i)}
                onClick={() => go(item)}
              />
            ))
          )}
        </div>
        <div
          className="flex items-center justify-between px-4 py-2 border-t border-[color:var(--rule)] text-[0.62rem] font-mono uppercase tracking-[0.12em] text-muted-foreground"
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
  const Icon = item.kind === "article" ? BookOpen : item.kind === "module" ? Map : Layers;
  const kindLabel =
    item.kind === "article" ? "Article" : item.kind === "module" ? "Module" : "Topic";

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
          ? "bg-[color:var(--ink-blue-wash)] text-[color:var(--ink)]"
          : "text-foreground/85"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-[color:var(--ink-blue)]"
        />
      )}
      <Icon
        className={`h-4 w-4 mt-0.5 shrink-0 ${active ? "text-[color:var(--ink-blue)]" : "text-muted-foreground"}`}
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-display text-[0.95rem] truncate ${active ? "text-[color:var(--ink-blue)]" : ""}`}
          >
            {item.title}
          </span>
          <span className="text-[0.58rem] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-[color:var(--rule)] px-1 py-px rounded-[2px]">
            {kindLabel}
          </span>
        </div>
        <div className="text-[0.78rem] text-muted-foreground mt-0.5 truncate">
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
    <kbd
      className="px-1.5 py-px text-[0.6rem] font-mono rounded-[2px] border border-[color:var(--rule-strong)]"
      style={{ background: "var(--surface-1)", color: "var(--ink)" }}
    >
      {children}
    </kbd>
  );
}
