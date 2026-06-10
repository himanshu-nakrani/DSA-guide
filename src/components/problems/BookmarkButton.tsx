import { Bookmark } from "lucide-react";
import Link from "next/link";
import { toggleBookmarkAction } from "@/app/lists/actions";

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
        className="inline-grid h-8 w-8 place-items-center rounded-sm border border-[color:var(--rule)] text-muted-foreground hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)] transition-colors"
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
      <button
        type="submit"
        className={`inline-grid h-8 w-8 place-items-center rounded-sm border transition-colors ${
          saved
            ? "border-[color:var(--ink-blue)] bg-[color:var(--ink-blue-wash)] text-[color:var(--ink-blue)]"
            : "border-[color:var(--rule)] text-muted-foreground hover:text-[color:var(--ink-blue)] hover:border-[color:var(--ink-blue)]"
        }`}
        aria-label={saved ? "Remove bookmark" : "Bookmark problem"}
        title={saved ? "Remove bookmark" : "Bookmark problem"}
      >
        <Bookmark className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} strokeWidth={1.6} />
      </button>
    </form>
  );
}
