"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function CreateListButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-ink justify-center gap-2 disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export function RemoveListButton({ listName }: { listName: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[color:var(--ink-blue)] transition-colors disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)] rounded-[2px]"
    >
      {pending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
      {pending ? "Removing..." : `Remove from ${listName}`}
    </button>
  );
}
