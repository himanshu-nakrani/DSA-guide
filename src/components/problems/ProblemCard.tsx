import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Difficulty, ProgressStatus } from "@/generated/prisma";
import { difficultyClass, difficultyLabel, progressLabel } from "@/components/problems/problem-ui";

export function ProblemCard({
  problem,
  topicName,
  moduleName,
  status,
  compact = false,
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
}) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group surface-card p-5 transition-colors hover:border-[color:var(--ink-blue)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[1.05rem] font-medium text-[color:var(--ink)] group-hover:text-[color:var(--ink-blue)] transition-colors">
              {problem.title}
            </h3>
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
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[color:var(--ink-blue)] group-hover:translate-x-0.5 transition-all" />
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-3 text-[0.75rem] text-muted-foreground">
          <span>{Math.round(problem.acceptanceRate)}% acceptance</span>
          <span>{problem.hints.length} hint{problem.hints.length === 1 ? "" : "s"}</span>
          <span>{problem.editorial ? "Editorial included" : "Editorial coming soon"}</span>
        </div>
      )}
    </Link>
  );
}
