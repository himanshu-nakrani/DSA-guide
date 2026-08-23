"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function ApplyFiltersButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-ink min-w-40 justify-center gap-2 disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending ? "Applying..." : "Apply filters"}
    </button>
  );
}
