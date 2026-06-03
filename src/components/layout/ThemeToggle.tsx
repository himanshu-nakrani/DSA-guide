"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";
const STORAGE_KEY = "dsa.theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme-transition", "");
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
    window.setTimeout(() => {
      document.documentElement.removeAttribute("data-theme-transition");
    }, 240);
  };

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={mounted ? label : undefined}
      className={
        collapsed
          ? "h-9 w-9 grid place-items-center rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
          : "inline-flex items-center gap-2 h-9 px-2.5 rounded-md text-sm text-foreground/75 hover:bg-accent hover:text-foreground transition-colors"
      }
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {!collapsed && (
        <span className="font-medium">
          {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
        </span>
      )}
    </button>
  );
}
