import Link from "next/link";
import { ViewTransition } from "react";
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
    <ViewTransition name={`problem-card-${problem.slug}`}>
      <div className="group rounded-xl border border-border bg-surface-1 p-5 shadow-[var(--shadow-card)] transition-all hover:border-border-hover hover:shadow-[var(--shadow-pop)]">
        <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/problems/${problem.slug}`} className="inline-flex items-center gap-1.5">
              <ViewTransition name={`problem-title-${problem.slug}`}>
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-ink-blue">
                  {problem.title}
                </h3>
              </ViewTransition>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-ink-blue" />
            </Link>
            <span className={difficultyClass[problem.difficulty]}>{difficultyLabel[problem.difficulty]}</span>
            {status && (
              <span className="pill border-rule text-muted-foreground">
                {progressLabel[status]}
              </span>
            )}
          </div>
          {(moduleName || topicName) && (
            <p className="mt-1.5 text-xs text-muted-foreground">
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
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-[13px] text-muted-foreground">
          <span className="tabular-nums">{Math.round(problem.acceptanceRate)}% acceptance</span>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-blue hover:underline"
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
    </ViewTransition>
  );
}
