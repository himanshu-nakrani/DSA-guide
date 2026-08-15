"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Focus, X } from "lucide-react";

const ATTR = "data-focus-mode";
const STORAGE_KEY = "dsa.focus";
const EVENT = "dsa:focus-change";

function read(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(ATTR);
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function write(next: boolean) {
  if (next) document.documentElement.setAttribute(ATTR, "");
  else document.documentElement.removeAttribute(ATTR);
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Reader focus mode. Toggles a `data-focus-mode` attribute on <html>; CSS
 * elsewhere reacts by hiding the sidebar and narrowing the page chrome.
 * Press `f` (when not typing in an input) to toggle.
 */
export function FocusMode() {
  const on = useSyncExternalStore(subscribe, read, getServerSnapshot);

  // Hydrate the html attribute from localStorage on first paint after mount.
  useEffect(() => {
    let initial = false;
    try {
      initial = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (initial && !read()) write(true);
  }, []);

  const toggle = useCallback(() => {
    write(!read());
  }, []);

  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && read()) {
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Exit focus mode" : "Enter focus mode"}
      title={on ? "Exit focus mode (esc)" : "Enter focus mode (f)"}
      suppressHydrationWarning
      className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground transition-colors rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
    >
      <span suppressHydrationWarning className="inline-flex items-center gap-1.5">
        {on ? <X className="h-3 w-3" /> : <Focus className="h-3 w-3" />}
        {on ? "Exit focus" : "Focus"}
        <kbd className="ml-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[0.6rem]">
          {on ? "esc" : "f"}
        </kbd>
      </span>
    </button>
  );
}
