"use client";

import { useEffect, useState } from "react";
import { Focus, X } from "lucide-react";

const ATTR = "data-focus-mode";
const STORAGE_KEY = "dsa.focus";

function readInitial(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(ATTR);
}

/**
 * Reader focus mode. Toggles a `data-focus-mode` attribute on <html>; CSS
 * elsewhere reacts by hiding the sidebar and narrowing the page chrome.
 * Press `f` (when not typing in an input) to toggle.
 */
export function FocusMode() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        return false;
      }
    })();
    if (initial) document.documentElement.setAttribute(ATTR, "");
    setOn(readInitial());
    setMounted(true);
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
      } else if (e.key === "Escape" && readInitial()) {
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    const next = !readInitial();
    if (next) document.documentElement.setAttribute(ATTR, "");
    else document.documentElement.removeAttribute(ATTR);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {}
    setOn(next);
  };

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        title={on ? "Exit focus mode (esc)" : "Enter focus mode (f)"}
        className="inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground transition-colors"
      >
        {on ? <X className="h-3 w-3" /> : <Focus className="h-3 w-3" />}
        {on ? "Exit focus" : "Focus"}
        <kbd className="ml-1 px-1.5 py-0.5 rounded border border-border bg-muted text-[0.6rem]">
          {on ? "esc" : "f"}
        </kbd>
      </button>
    </>
  );
}
