"use client";

import { Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleBookmarkAction } from "@/app/lists/actions";
import { toast } from "@/components/ui/toast";

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
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href="/auth"
        className="inline-grid h-9 w-9 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-ink-blue hover:border-ink-blue transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)]"
        aria-label="Sign in to bookmark this problem"
        title="Sign in to bookmark"
      >
        <Bookmark className="h-4 w-4" strokeWidth={1.6} />
      </Link>
    );
  }

  const onToggle = () => {
    // Flip immediately, then reconcile with the server's authoritative result.
    const next = !optimisticSaved;
    setOptimisticSaved(next);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("problemSlug", problemSlug);
        formData.set("returnTo", returnTo);
        const result = await toggleBookmarkAction(formData);
        if (!result.ok) {
          setOptimisticSaved(!next);
          toast("Couldn't update the bookmark", { tone: "error" });
          return;
        }
        setOptimisticSaved(result.saved);
        toast(result.saved ? "Saved to bookmarks" : "Removed from bookmarks", {
          key: "bookmark",
        });
      } catch {
        setOptimisticSaved(!next);
        toast("Couldn't update the bookmark", { tone: "error" });
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      className={`inline-grid h-9 w-9 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 place-items-center rounded-md border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ink-blue)] ${
        optimisticSaved
          ? "border-ink-blue bg-ink-blue-wash text-ink-blue"
          : "border-rule text-muted-foreground hover:text-ink-blue hover:border-ink-blue"
      } ${pending ? "opacity-60 disabled:cursor-not-allowed" : ""}`}
      aria-pressed={optimisticSaved}
      aria-label={optimisticSaved ? "Remove bookmark" : "Bookmark problem"}
      title={optimisticSaved ? "Remove bookmark" : "Bookmark problem"}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Bookmark
          className={optimisticSaved ? "h-4 w-4 fill-current" : "h-4 w-4"}
          strokeWidth={1.6}
        />
      )}
    </button>
  );
}
