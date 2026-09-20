"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

/**
 * Dialog parts over Base UI. The popup is a neutral sheet; the backdrop
 * dims the page without color casts so it works in both themes. Composed
 * here as confirm dialogs and future modal surfaces.
 */
export function DialogRoot(props: React.ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root {...props} />;
}

export function DialogTrigger(props: React.ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger {...props} />;
}

export function DialogClose(props: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close {...props} />;
}

export function DialogPortal(props: React.ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal {...props} />;
}

export function DialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Backdrop>) {
  return (
    <Dialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--full-contrast)_45%,transparent)] transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)]",
        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogPopup({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Popup>) {
  return (
    <Dialog.Popup
      className={cn(
        "bg-surface-1 border border-rule-strong shadow-pop outline-none",
        "transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cn("font-display font-medium text-ink", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return <Dialog.Description className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Dialog };
