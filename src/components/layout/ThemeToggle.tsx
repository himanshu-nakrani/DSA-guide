"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";
const STORAGE_KEY = "dsa.theme";

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

// Server snapshot has to match what the server actually rendered. The root
// layout pins data-theme="light" on the server, so "light" is the honest
// answer; the inline bootstrap script swaps the attribute before React
// hydrates, and `suppressHydrationWarning` on the dynamic bits below lets
// React reconcile to the real theme without a hydration error.
function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(cb: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme-transition", "");
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    window.setTimeout(() => {
      document.documentElement.removeAttribute("data-theme-transition");
    }, 260);
  };

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={
        collapsed
          ? "h-9 w-9 grid place-items-center rounded-sm text-foreground/70 hover:text-[color:var(--ink-blue)] transition-colors"
          : "inline-flex items-center gap-2 h-9 px-2.5 rounded-sm text-sm text-foreground/75 hover:text-[color:var(--ink-blue)] transition-colors"
      }
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} suppressHydrationWarning />
      {!collapsed && (
        <span className="font-medium" suppressHydrationWarning>
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
