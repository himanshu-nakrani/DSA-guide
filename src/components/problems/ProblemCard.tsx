import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Difficulty, ProgressStatus } from "@/generated/prisma";
import { BookmarkButton } from "@/components/problems/BookmarkButton";
import { difficultyClass, difficultyLabel, progressLabel } from "@/components/problems/problem-ui";

export function ProblemCard({
  problem,
  topicName,
  moduleName,
  status,
  compact = false,
  bookmarked = false,
  signedIn = false,
  returnTo = "/problems",
}: {
  problem: {
    slug: string;
    title: string;
    difficulty: Difficulty;
    acceptanceRate: number;
    editorial: { id: string } | null;
    hints: { id: string }[];
  };
  topicName?: string;
  moduleName?: string;
  status?: ProgressStatus | null;
  compact?: boolean;
  bookmarked?: boolean;
  signedIn?: boolean;
  returnTo?: string;
}) {
  return (
    <div
      className="group surface-card p-5 transition-colors hover:border-[color:var(--ink-blue)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/problems/${problem.slug}`} className="inline-flex items-center gap-1.5">
              <h3 className="font-display text-[1.05rem] font-medium text-[color:var(--ink)] hover:text-[color:var(--ink-blue)] transition-colors">
                {problem.title}
              </h3>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:text-[color:var(--ink-blue)] group-hover:translate-x-0.5" />
            </Link>
            <span className={difficultyClass[problem.difficulty]}>{difficultyLabel[problem.difficulty]}</span>
            {status && (
              <span className="pill border-[color:var(--rule)] text-muted-foreground">
                {progressLabel[status]}
              </span>
            )}
          </div>
          {(moduleName || topicName) && (
            <p className="mt-1 text-[0.72rem] font-mono uppercase tracking-[0.1em] text-muted-foreground">
              {[moduleName, topicName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <BookmarkButton
          problemSlug={problem.slug}
          saved={bookmarked}
          signedIn={signedIn}
          returnTo={returnTo}
        />
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-3 text-[0.75rem] text-muted-foreground">
          <span>{Math.round(problem.acceptanceRate)}% acceptance</span>
          <span>{problem.hints.length} hint{problem.hints.length === 1 ? "" : "s"}</span>
          <span>{problem.editorial ? "Editorial included" : "Editorial coming soon"}</span>
        </div>
      )}
    </div>
  );
}
