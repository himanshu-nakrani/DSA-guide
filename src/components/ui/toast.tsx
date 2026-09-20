"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  key?: string;
  message: string;
  tone: ToastTone;
};

const MAX_TOASTS = 3;

let nextId = 1;
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function snapshot(): Toast[] {
  return toasts;
}
const EMPTY_TOASTS: Toast[] = [];

function getServerSnapshot(): Toast[] {
  return EMPTY_TOASTS;
}

function dismiss(id: number) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  if (toasts.some((t) => t.id === id)) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }
}

/**
 * Push a toast. `key` dedupes: a new toast with the same key replaces the
 * old one instead of stacking (used for rapid repeat actions like status
 * changes). Errors linger longer than confirmations.
 */
export function toast(
  message: string,
  opts?: { tone?: ToastTone; key?: string; durationMs?: number },
): number {
  const tone = opts?.tone ?? "success";
  const durationMs = opts?.durationMs ?? (tone === "error" ? 6000 : 4000);
  const id = nextId++;
  const entry: Toast = { id, key: opts?.key, message, tone };
  if (entry.key) toasts = toasts.filter((t) => t.key !== entry.key);
  toasts = [...toasts, entry].slice(-MAX_TOASTS);
  emit();
  timers.set(
    id,
    setTimeout(() => dismiss(id), durationMs),
  );
  return id;
}

export function dismissToast(id: number) {
  dismiss(id);
}

const toneIcon = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const;

const toneClass = {
  success: "text-ink-green",
  error: "text-ink-red",
  info: "text-ink-blue",
} as const;

export function Toaster() {
  const items = useSyncExternalStore(subscribe, snapshot, getServerSnapshot);
  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[90] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-2"
    >
      {items.map((item) => {
        const Icon = toneIcon[item.tone];
        return (
          <div
            key={item.id}
            role="status"
            className="toast-enter flex items-start gap-2.5 rounded-lg border border-border bg-surface-1 px-4 py-3 shadow-[var(--shadow-pop)]"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneClass[item.tone])} />
            <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">
              {item.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
