"use client";

import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toggleBookmarkAction } from "@/app/lists/actions";

function SubmitButton({ saved }: { saved: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-grid h-8 w-8 place-items-center rounded-sm border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)] ${
        saved
          ? "border-[color:var(--ink-blue)] bg-[color:var(--ink-blue-wash)] text-[color:var(--ink-blue)]"
          : "border-[color:var(--rule)] text-muted-foreground hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)]"
      } ${pending ? "opacity-60 disabled:cursor-not-allowed" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark problem"}
      title={saved ? "Remove bookmark" : "Bookmark problem"}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Bookmark className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} strokeWidth={1.6} />
      )}
    </button>
  );
}

export function BookmarkButton({
  problemSlug,
  saved,
  signedIn,
  returnTo,
}: {
  problemSlug: string;
  saved: boolean;
  signedIn: boolean;
  returnTo: string;
}) {
  if (!signedIn) {
    return (
      <Link
        href="/auth"
        className="inline-grid h-8 w-8 place-items-center rounded-sm border border-[color:var(--rule)] text-muted-foreground hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-1)]"
        aria-label="Sign in to bookmark this problem"
        title="Sign in to bookmark"
      >
        <Bookmark className="h-4 w-4" strokeWidth={1.6} />
      </Link>
    );
  }

  return (
    <form action={toggleBookmarkAction}>
      <input type="hidden" name="problemSlug" value={problemSlug} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <SubmitButton saved={saved} />
    </form>
  );
}
