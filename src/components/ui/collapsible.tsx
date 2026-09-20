"use client";

import * as React from "react";
import { Collapsible } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";

/**
 * Minimal collapsible — a bordered card section whose header row carries a
 * caret that rotates open. Used for roadmap modules and editorial sections.
 */
export function CollapsibleRoot({
  className,
  ...props
}: React.ComponentProps<typeof Collapsible.Root>) {
  return <Collapsible.Root className={cn("border-b border-border", className)} {...props} />;
}

export function CollapsibleTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Collapsible.Trigger>) {
  return (
    <Collapsible.Trigger
      className={cn(
        "group/section flex w-full items-center justify-between gap-3 py-3 text-left cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export function CollapsiblePanel({
  className,
  ...props
}: React.ComponentProps<typeof Collapsible.Panel>) {
  return <Collapsible.Panel className={cn("focus-visible:outline-none", className)} {...props} />;
}

export { Collapsible };
