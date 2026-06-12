import "server-only";

import { ProgressStatus } from "@/generated/prisma";

export function isProblemComplete(status?: ProgressStatus | null) {
  return status === ProgressStatus.SOLVED || status === ProgressStatus.MASTERED;
}

export function isProblemStarted(status?: ProgressStatus | null) {
  return Boolean(status && status !== ProgressStatus.NEW);
}

export function summarizeProblemProgress(
  problemIds: string[],
  progressByProblemId: Map<string, ProgressStatus>,
) {
  const uniqueProblemIds = Array.from(new Set(problemIds));
  const solved = uniqueProblemIds.filter((problemId) =>
    isProblemComplete(progressByProblemId.get(problemId)),
  ).length;
  const started = uniqueProblemIds.filter((problemId) =>
    isProblemStarted(progressByProblemId.get(problemId)),
  ).length;

  return {
    total: uniqueProblemIds.length,
    solved,
    started,
    percent: uniqueProblemIds.length === 0 ? 0 : Math.round((solved / uniqueProblemIds.length) * 100),
  };
}

export function pickNextProblem<T extends { id: string }>(
  problems: T[],
  progressByProblemId: Map<string, ProgressStatus>,
) {
  return (
    problems.find((problem) => !isProblemStarted(progressByProblemId.get(problem.id))) ??
    problems.find((problem) => !isProblemComplete(progressByProblemId.get(problem.id))) ??
    problems[0] ??
    null
  );
}
