"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Map, Code2, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon; soon?: boolean }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/problems", label: "Problems", icon: Code2, soon: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border h-screen sticky top-0 flex flex-col bg-[color:var(--sidebar)]">
      <div className="px-6 pt-6 pb-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-sm shadow-sm"
            aria-hidden
          >
            ⌘
          </div>
          <div>
            <div className="font-display text-[0.95rem] leading-none">DSA Guide</div>
            <div className="font-mono text-[0.65rem] text-muted-foreground mt-1.5">
              v1.0 · 2026
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/75 hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.soon && (
                <span className="text-[0.62rem] font-mono uppercase tracking-[0.04em] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-6 pt-5 border-t border-border space-y-4">
        <div>
          <div className="eyebrow mb-1.5">Sources</div>
          <p className="text-[0.78rem] leading-relaxed text-muted-foreground">
            CLRS, Sedgewick &amp; Wayne, Laaksonen,
            MIT&nbsp;OCW, cp-algorithms.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-1.5">Maintained by</div>
          <p className="text-[0.82rem] font-medium">
            Himanshu Nakrani
          </p>
        </div>
      </div>
    </aside>
  );
}
