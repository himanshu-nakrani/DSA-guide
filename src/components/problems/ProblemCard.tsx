import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Difficulty, ProgressStatus } from "@/generated/prisma";
import { BookmarkButton } from "@/components/problems/BookmarkButton";
import { ProblemQuickStatusSelect } from "@/components/problems/ProblemQuickStatusSelect";
import { difficultyClass, difficultyLabel, progressLabel } from "@/components/problems/problem-ui";
import { getProblemExternalUrl } from "@/lib/problem-links";

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
  const externalUrl = getProblemExternalUrl(problem.slug);

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
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.75rem] text-muted-foreground">
          <span>{Math.round(problem.acceptanceRate)}% acceptance</span>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[color:var(--ink-blue)] hover:underline"
            >
              Solve on LeetCode
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <ProblemQuickStatusSelect
            slug={problem.slug}
            initialStatus={status ?? ProgressStatus.NEW}
            signedIn={signedIn}
          />
        </div>
      )}
    </div>
  );
}
