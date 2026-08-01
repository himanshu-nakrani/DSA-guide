import "server-only";

import { ProgressStatus } from "@/generated/prisma";

export function isProblemComplete(status?: ProgressStatus | null) {
  return status === ProgressStatus.SOLVED || status === ProgressStatus.MASTERED;
}

export function isProblemStarted(status?: ProgressStatus | null) {
  return Boolean(status && status !== ProgressStatus.NEW);
}

// ⚡ Bolt: Single pass iteration over a Set avoids intermediate Array allocations
// and multiple O(N) filter traversals.
export function summarizeProblemProgress(
  problemIds: string[],
  progressByProblemId: Map<string, ProgressStatus>,
) {
  const uniqueProblemIds = new Set(problemIds);
  let solved = 0;
  let started = 0;

  for (const problemId of uniqueProblemIds) {
    const status = progressByProblemId.get(problemId);
    if (isProblemComplete(status)) solved++;
    if (isProblemStarted(status)) started++;
  }

  const total = uniqueProblemIds.size;
  return {
    total,
    solved,
    started,
    percent: total === 0 ? 0 : Math.round((solved / total) * 100),
  };
}

// ⚡ Bolt: A single loop replaces multiple Array.prototype.find calls to prevent
// multiple O(N) traversals, returning early for the first unstarted problem.
export function pickNextProblem<T extends { id: string }>(
  problems: T[],
  progressByProblemId: Map<string, ProgressStatus>,
) {
  let firstUncompleted = null;

  for (const problem of problems) {
    const status = progressByProblemId.get(problem.id);

    if (!isProblemStarted(status)) {
      return problem;
    }

    if (!firstUncompleted && !isProblemComplete(status)) {
      firstUncompleted = problem;
    }
  }

  return firstUncompleted ?? problems[0] ?? null;
}
