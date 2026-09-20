"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bookmark, Ellipsis, LayoutDashboard, LogOut, Search } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/app/auth/actions";
import { BrandMark } from "@/components/ui/BrandMark";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/problems", label: "Problems" },
];

const accountLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lists", label: "Lists", icon: Bookmark },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const menuPopupClass =
  "min-w-52 overflow-hidden rounded-xl border border-border bg-surface-1 p-1.5 shadow-[var(--shadow-pop)] transition-[opacity,transform,scale] duration-[var(--dur-fast)] ease-[var(--ease-out)] data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95";

const menuItemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 data-[highlighted]:bg-surface-2";

function SignOutItem() {
  const [pending, startTransition] = useTransition();
  return (
    <Menu.Item
      disabled={pending}
      closeOnClick={false}
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      className={menuItemClass}
    >
      <LogOut className="h-4 w-4 text-muted-foreground" />
      {pending ? "Signing out…" : "Sign out"}
    </Menu.Item>
  );
}

export function Header({
  user,
}: {
  user: { name: string | null; email: string } | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const initial = ((user?.name ?? user?.email ?? "?").trim()[0] ?? "?").toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/85 backdrop-blur transition-[border-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] ${
        scrolled ? "border-border-hover shadow-[var(--shadow-card)]" : "border-border"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="DSA Guide — home"
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105"
          >
            <BrandMark size={18} className="text-background" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            DSA Guide
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
          {primaryLinks.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex h-16 items-center px-3 text-sm transition-colors ${
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("dsa:open-palette"))}
            aria-label="Search (Ctrl+K)"
            title="Search (Ctrl+K)"
            className="inline-flex h-10 min-h-[44px] items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-border-hover hover:text-foreground"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden font-mono text-[11px] text-muted-foreground md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle collapsed />
          {scrolled && (
            <div className="lg:hidden">
              <Menu.Root>
                <Menu.Trigger
                  aria-label="Navigation menu"
                  className="grid h-10 w-10 min-h-[44px] min-w-[44px] place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--links)]"
                >
                  <Ellipsis className="h-4 w-4" />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                    <Menu.Popup className={menuPopupClass} aria-label="Navigation">
                      {primaryLinks.map((link) => (
                        <Menu.Item
                          key={link.href}
                          closeOnClick
                          render={<Link href={link.href}>{link.label}</Link>}
                          className={menuItemClass}
                        />
                      ))}
                      <Menu.Separator className="mx-2 my-1.5 h-px bg-border" />
                      {accountLinks.map((link) => (
                        <Menu.Item
                          key={link.href}
                          closeOnClick
                          render={
                            <Link href={link.href}>
                              <link.icon className="h-4 w-4 text-muted-foreground" />
                              {link.label}
                            </Link>
                          }
                          className={menuItemClass}
                        />
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            </div>
          )}
          {user ? (
            <Menu.Root>
              <Menu.Trigger
                title={user.email}
                aria-label={`Account menu (${user.email})`}
                className="grid h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-foreground transition-colors outline-none hover:bg-border-light focus-visible:ring-2 focus-visible:ring-[color:var(--links)] data-[popup-open]:bg-border-light"
              >
                {initial}
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                  <Menu.Popup className={menuPopupClass} aria-label="Account">
                    <div className="px-3 py-2">
                      <div className="truncate text-sm font-medium text-foreground">
                        {user.name ?? "Account"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <Menu.Separator className="mx-2 my-1.5 h-px bg-border" />
                    {accountLinks.map((link) => (
                      <Menu.Item
                        key={link.href}
                        closeOnClick
                        render={
                          <Link href={link.href}>
                            <link.icon className="h-4 w-4 text-muted-foreground" />
                            {link.label}
                          </Link>
                        }
                        className={menuItemClass}
                      />
                    ))}
                    <Menu.Separator className="mx-2 my-1.5 h-px bg-border" />
                    <SignOutItem />
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          ) : (
            <Link
              href="/auth"
              className="inline-flex h-10 min-h-[44px] items-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <nav
        aria-label="Primary"
        className={`no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-border px-4 transition-all duration-[var(--dur-base)] ease-[var(--ease-out)] lg:hidden ${
          scrolled
            ? "max-h-0 py-0 opacity-0 pointer-events-none border-t-transparent overflow-hidden"
            : "max-h-16 py-2 opacity-100"
        }`}
      >
        {primaryLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 min-h-[44px] items-center rounded-md px-3.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-surface-2 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Menu.Root>
          <Menu.Trigger
            aria-label="More sections"
            className="flex shrink-0 min-h-[44px] items-center gap-1 rounded-md px-3.5 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[color:var(--links)] data-[popup-open]:bg-surface-2 data-[popup-open]:text-foreground"
          >
            <Ellipsis className="h-4 w-4" />
            More
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="start" sideOffset={8}>
              <Menu.Popup className={menuPopupClass} aria-label="More sections">
                {accountLinks.map((link) => (
                  <Menu.Item
                    key={link.href}
                    closeOnClick
                    render={
                      <Link href={link.href}>
                        <link.icon className="h-4 w-4 text-muted-foreground" />
                        {link.label}
                      </Link>
                    }
                    className={menuItemClass}
                  />
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </nav>
    </header>
  );
}
