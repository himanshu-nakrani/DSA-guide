"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Front Matter", marker: "i" },
  { href: "/learn", label: "Learnings", marker: "ii" },
  { href: "/roadmap", label: "Roadmap", marker: "iii" },
  { href: "/problems", label: "Problems", marker: "iv", soon: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 border-r border-border h-screen sticky top-0 flex flex-col bg-[color:var(--sidebar)]">
      <div className="px-8 pt-10 pb-8 border-b border-border/70">
        <div className="smallcaps text-muted-foreground mb-2">Vol. I &nbsp;·&nbsp; MMXXVI</div>
        <Link href="/" className="block">
          <div className="font-display text-[1.65rem] leading-[1.05] tracking-tight">
            A Practitioner&rsquo;s
            <br />
            <em className="font-display italic">Treatise</em>
            <br />
            on Algorithms
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-8 py-8 space-y-1">
        <div className="smallcaps text-muted-foreground mb-4">Contents</div>
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="group flex items-baseline gap-4 py-2.5 -mx-2 px-2 rounded-sm transition-colors hover:bg-accent/60"
            >
              <span
                className={`font-mono text-[0.7rem] tracking-wider uppercase pt-0.5 w-6 tabular-nums ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.marker}
              </span>
              <span
                className={`font-display text-[1.05rem] flex-1 ${
                  active ? "text-foreground italic" : "text-foreground/85"
                }`}
              >
                {item.label}
              </span>
              {item.soon && (
                <span className="smallcaps text-muted-foreground/80 text-[0.6rem]">
                  forthcoming
                </span>
              )}
              {active && (
                <span
                  aria-hidden
                  className="text-primary text-sm leading-none"
                  style={{ fontFeatureSettings: '"ss01"' }}
                >
                  ❦
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 pb-8 pt-6 border-t border-border/70 space-y-5">
        <div>
          <div className="smallcaps text-muted-foreground mb-2">Sources</div>
          <p className="font-serif text-[0.85rem] leading-relaxed text-muted-foreground italic">
            Cormen et&nbsp;al., Sedgewick &amp; Wayne, Laaksonen,
            MIT&nbsp;OCW, cp-algorithms.
          </p>
        </div>
        <div>
          <div className="smallcaps text-muted-foreground mb-2">Edited by</div>
          <p className="font-display text-[0.95rem] leading-snug">
            Himanshu <em>Nakrani</em>
          </p>
        </div>
      </div>
    </aside>
  );
}
