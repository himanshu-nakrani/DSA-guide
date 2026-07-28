"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SaveToListButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-ink justify-center gap-2 disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Saving..." : "Save"}
    </button>
  );
}
