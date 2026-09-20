"use client";

import * as React from "react";
import { Tabs } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

/**
 * Minimal tabs — small chips, selected tab gets an accent wash.
 * Used for language pickers and other short in-page switching.
 */
export function TabsRoot({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Root>) {
  return <Tabs.Root className={cn(className)} {...props} />;
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.List>) {
  return (
    <Tabs.List
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  );
}

export function TabsTab({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Tab>) {
  return (
    <Tabs.Tab
      className={cn(
        "font-mono text-caption uppercase tracking-[0.1em] px-3 py-1.5 min-h-[40px] inline-flex items-center rounded-md border border-transparent text-muted-foreground hover:text-ink-blue transition-colors cursor-pointer",
        "data-[selected]:border-ink-blue/40 data-[selected]:bg-ink-blue-wash data-[selected]:text-ink-blue",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Panel>) {
  // keepMounted keeps inactive panels in the DOM (hidden) — content stays
  // server-rendered, searchable, and crawlable instead of vanishing per tab.
  return (
    <Tabs.Panel keepMounted className={cn("focus-visible:outline-none", className)} {...props} />
  );
}

export { Tabs as TabsNamespace };

