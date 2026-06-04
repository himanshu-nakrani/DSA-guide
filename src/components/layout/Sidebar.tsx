"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Map, Code2, Home, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navItems: { href: string; label: string; icon: LucideIcon; soon?: boolean }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/problems", label: "Problems", icon: Code2, soon: true },
];

const COLLAPSE_KEY = "dsa.sidebar.collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setCollapsed((c) => {
          const next = !c;
          try {
            localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted]);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const widthClass = collapsed ? "md:w-[68px]" : "md:w-64";

  return (
    <aside
      className={`w-full ${widthClass} shrink-0 border-b md:border-b-0 md:border-r border-sidebar-border md:h-screen md:sticky md:top-0 flex flex-col bg-sidebar transition-[width] duration-300`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <div className="px-3 md:px-4 py-4 md:pt-5 md:pb-4 border-b border-sidebar-border flex items-center justify-between gap-2">
        <Link
          href="/"
          className={`flex items-center gap-2.5 group ${collapsed ? "md:justify-center md:w-full" : ""}`}
          aria-label="DSA Guide — home"
        >
          <BrandMark />
          {!collapsed && (
            <div className="md:block">
              <div className="font-display text-[1rem] leading-none tracking-tight">
                DSA Guide
              </div>
              <div className="font-mono text-[0.62rem] text-muted-foreground mt-1.5 tracking-[0.06em]">
                INKWELL · v1.0
              </div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar (⌘\\)"
            title="Collapse sidebar (⌘\\)"
            className="hidden md:grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div
        className={`hidden md:block ${collapsed ? "px-2" : "px-3"} pt-3`}
      >
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("dsa:open-palette"))
          }
          title="Search (⌘K)"
          className={`group w-full inline-flex items-center ${
            collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
          } py-2 rounded-md border border-border bg-[color:var(--surface-1,var(--card))] text-foreground/65 hover:text-foreground hover:border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))] transition-colors`}
        >
          <span className="inline-flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" strokeWidth={1.75} />
            {!collapsed && <span>Search</span>}
          </span>
          {!collapsed && (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em] text-muted-foreground">
              ⌘K
            </span>
          )}
        </button>
      </div>

      <nav
        className={`flex md:flex-1 gap-1 overflow-x-auto px-3 py-2 md:py-4 md:space-y-0.5 md:block ${
          collapsed ? "md:px-2" : ""
        }`}
      >
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={`group relative flex shrink-0 items-center gap-2 md:gap-3 ${
                collapsed ? "md:justify-center md:px-2" : "px-3"
              } py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/75 hover:bg-accent hover:text-foreground"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-primary"
                />
              )}
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && (
                <>
                  <span className="md:flex-1 font-medium">{item.label}</span>
                  {item.soon && (
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.06em] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer area: theme toggle + (optional) sources */}
      <div
        className={`hidden md:flex flex-col gap-3 border-t border-sidebar-border ${
          collapsed ? "px-2 py-3 items-center" : "px-4 py-4"
        }`}
      >
        <div className={collapsed ? "flex flex-col items-center gap-1" : "flex items-center justify-between"}>
          <ThemeToggle collapsed={collapsed} />
          {collapsed && (
            <button
              type="button"
              onClick={toggle}
              aria-label="Expand sidebar (⌘\\)"
              title="Expand sidebar (⌘\\)"
              className="h-9 w-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-3 pt-1">
            <div>
              <div className="eyebrow mb-1.5">Sources</div>
              <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
                CLRS, Sedgewick &amp; Wayne, Laaksonen, MIT&nbsp;OCW, cp-algorithms.
              </p>
            </div>
            <div>
              <div className="eyebrow mb-1.5">Maintained by</div>
              <p className="text-[0.82rem] font-medium">Himanshu Nakrani</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/**
 * Brand glyph — a traced path through a tiny graph. Picks up `currentColor`
 * for the node stroke and `--primary` for the highlighted edge, so it adapts
 * to both themes automatically.
 */
function BrandMark() {
  return (
    <span
      aria-hidden
      className="relative h-8 w-8 rounded-lg grid place-items-center"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--primary) 18%, transparent) 0%, color-mix(in srgb, var(--primary) 6%, transparent) 100%)",
        border: "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
        boxShadow:
          "inset 0 1px 0 0 color-mix(in srgb, var(--primary) 22%, transparent)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* edges */}
        <path d="M5 6 L12 12" opacity="0.35" />
        <path d="M19 6 L12 12" opacity="0.35" />
        <path d="M5 18 L12 12" opacity="0.35" />
        {/* highlighted traced edge */}
        <path d="M12 12 L19 18" stroke="var(--primary)" strokeWidth="2" />
        {/* nodes */}
        <circle cx="5" cy="6" r="1.6" fill="currentColor" opacity="0.55" />
        <circle cx="19" cy="6" r="1.6" fill="currentColor" opacity="0.55" />
        <circle cx="5" cy="18" r="1.6" fill="currentColor" opacity="0.55" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        <circle cx="19" cy="18" r="1.8" fill="var(--primary)" stroke="var(--primary)" />
      </svg>
    </span>
  );
}
