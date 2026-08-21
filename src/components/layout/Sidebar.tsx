"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { Bookmark, BookOpen, Map, Code2, Home, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Search, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import type { SearchItem } from "@/lib/searchIndex";

const navItems: { href: string; label: string; icon: LucideIcon; soon?: boolean }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/lists", label: "Lists", icon: Bookmark },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auth", label: "Account", icon: User },
];

const COLLAPSE_KEY = "dsa.sidebar.collapsed";
const COLLAPSE_EVENT = "dsa:sidebar-collapse-change";
const HTML_ATTR = "data-sidebar-collapsed";

function readCollapsed(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(HTML_ATTR);
}

function subscribeCollapsed(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(COLLAPSE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(COLLAPSE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getCollapsedServer(): boolean {
  return false;
}

function writeCollapsed(next: boolean) {
  if (next) document.documentElement.setAttribute(HTML_ATTR, "");
  else document.documentElement.removeAttribute(HTML_ATTR);
  try {
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(COLLAPSE_EVENT));
}

/**
 * Sidebar — printed-index navigation. Always renders the expanded DOM tree;
 * collapsed state is driven by `<html data-sidebar-collapsed>` so CSS can
 * hide labels and shrink the width before React hydrates. This avoids the
 * visible flash when a user with a collapsed preference loads the page.
 */
export function Sidebar({ searchIndex = [] }: { searchIndex?: SearchItem[] }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    getCollapsedServer,
  );

  // When the user is reading an article, surface its title + module in the
  // sidebar — the printed-manuscript equivalent of "you are here in the
  // table of contents." Falls back to nothing on non-article routes.
  const currentArticle = useMemo<
    Extract<SearchItem, { kind: "article" }> | null
  >(() => {
    const m = /^\/learn\/([^/?#]+)/.exec(pathname);
    if (!m) return null;
    const href = `/learn/${m[1]}`;
    const found = searchIndex.find(
      (it) => it.kind === "article" && it.href === href,
    );
    return found && found.kind === "article" ? found : null;
  }, [pathname, searchIndex]);

  const toggle = useCallback(() => {
    writeCollapsed(!readCollapsed());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        writeCollapsed(!readCollapsed());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <aside
      id="dsa-sidebar"
      data-sidebar
      className="dsa-sidebar w-full shrink-0 border-b md:border-b-0 md:border-r border-sidebar-border md:h-screen md:sticky md:top-0 flex flex-col bg-sidebar transition-[width] duration-300"
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <div className="dsa-sidebar-head px-3 md:px-4 py-4 md:pt-5 md:pb-4 border-b border-sidebar-border flex items-center justify-between gap-2">
        <Link
          href="/"
          className="dsa-sidebar-brand flex items-center gap-2.5 group"
          aria-label="DSA Guide — home"
        >
          <BrandMark />
          <div className="dsa-collapse-hide md:block leading-none">
            <div className="font-display text-[1.05rem] tracking-[0.005em] text-[color:var(--ink)]">
              DSA Guide
            </div>
            <div className="font-mono text-[0.6rem] text-muted-foreground mt-1.5 tracking-[0.14em] uppercase">
              Manuscript ed.
            </div>
          </div>
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls="dsa-sidebar"
          aria-label="Collapse sidebar (⌘\\)"
          title="Collapse sidebar (⌘\\)"
          className="dsa-collapse-hide hidden md:grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
        >
          <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="dsa-sidebar-search hidden md:block px-3 pt-3">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("dsa:open-palette"))
          }
          title="Search (⌘K)"
          aria-label="Search"
          className="group w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-sm border border-[color:var(--rule-strong)] bg-transparent text-foreground/70 hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
        >
          <span className="inline-flex items-center gap-2 text-[0.85rem]">
            <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="dsa-collapse-hide">Search</span>
          </span>
          <span className="dsa-collapse-hide font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted-foreground">
            ⌘K
          </span>
        </button>
      </div>

      <div className="dsa-collapse-hide hidden md:block px-4 pt-5 pb-1.5">
        <div className="eyebrow">Index</div>
      </div>

      <nav className="dsa-sidebar-nav flex md:flex-1 gap-1 overflow-x-auto px-3 py-2 md:py-1 md:space-y-0 md:block">
        {navItems.map((item, i) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`group relative flex shrink-0 items-center gap-2 md:gap-3 px-3 py-1.5 rounded-sm text-[0.92rem] transition-colors ${
                active
                  ? "text-[color:var(--ink-blue)] font-medium"
                  : "text-foreground/80 hover:text-[color:var(--ink-blue)]"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="dsa-active-mark absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-[color:var(--ink-blue)]"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 1.9 : 1.5} />
              <span className="dsa-collapse-hide md:flex-1">
                <span className="font-mono text-[0.6rem] text-muted-foreground mr-2 tabular-nums tracking-[0.1em]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </span>
              {item.soon && (
                <span className="dsa-collapse-hide text-[0.55rem] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-[color:var(--rule)] px-1 py-px rounded-[2px]">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {currentArticle && (
        <div className="dsa-collapse-hide hidden md:block border-t border-sidebar-border px-4 py-4">
          <div className="eyebrow mb-2">Reading</div>
          <div className="flex items-start gap-2 -ml-3 pl-3 border-l-2 border-[color:var(--ink-blue)]">
            <div className="min-w-0">
              <div className="font-display text-[0.95rem] leading-snug text-[color:var(--ink-blue)]">
                {currentArticle.title}
              </div>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground mt-1 truncate">
                {currentArticle.moduleName}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dsa-sidebar-foot hidden md:flex flex-col gap-3 border-t border-sidebar-border px-4 py-4">
        <div className="dsa-sidebar-foot-row flex items-center justify-between">
          <ThemeToggle collapsed={collapsed} />
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="dsa-sidebar"
            aria-label="Expand sidebar (⌘\\)"
            title="Expand sidebar (⌘\\)"
            className="dsa-expand-show h-9 w-9 grid place-items-center rounded-sm text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
          >
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="dsa-collapse-hide space-y-3 pt-1">
          <div>
            <div className="eyebrow mb-1.5">Sources</div>
            <p className="text-[0.78rem] leading-relaxed text-muted-foreground font-pencil">
              CLRS, Sedgewick &amp; Wayne, Laaksonen, MIT&nbsp;OCW, cp-algorithms.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-1.5">Editor</div>
            <p className="text-[0.82rem] font-medium">Himanshu Nakrani</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Brand glyph — a small bookmark with a blue ink corner.
 */
function BrandMark() {
  return (
    <span
      aria-hidden
      className="relative h-8 w-7 grid place-items-center"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--rule-strong)",
        borderRadius: "1px",
        boxShadow: "1px 1px 0 0 var(--rule)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4 L6 20 L11 20 C16 20 19 16.5 19 12 C19 7.5 16 4 11 4 Z" stroke="var(--ink)" />
        <path d="M14 7 L20 13" stroke="var(--ink-blue)" strokeWidth="1.8" />
      </svg>
    </span>
  );
}
