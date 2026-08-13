import "server-only";

import { ProgressStatus } from "@/generated/prisma";

export function isProblemComplete(status?: ProgressStatus | null) {
  return status === ProgressStatus.SOLVED || status === ProgressStatus.MASTERED;
}

export function isProblemStarted(status?: ProgressStatus | null) {
  return Boolean(status && status !== ProgressStatus.NEW);
}

export type StoredProblemProgress = {
  status: ProgressStatus;
  attempts: number;
  solvedAt: Date | null;
  lastAttemptedAt: Date | null;
};

export type ProblemProgressTransition = StoredProblemProgress & {
  changed: boolean;
};

/**
 * Apply a learner-selected state without treating repeated UI submissions as
 * new attempts. `attempts` records entries into active practice; `solvedAt`
 * records the first completion until the learner explicitly resets to NEW.
 */
export function transitionProblemProgress(
  existing: StoredProblemProgress | null,
  nextStatus: ProgressStatus,
  now = new Date(),
): ProblemProgressTransition {
  if (!existing) {
    const started = isProblemStarted(nextStatus);
    const complete = isProblemComplete(nextStatus);
    return {
      status: nextStatus,
      attempts: started ? 1 : 0,
      lastAttemptedAt: started ? now : null,
      solvedAt: complete ? now : null,
      changed: true,
    };
  }

  if (existing.status === nextStatus) {
    return { ...existing, changed: false };
  }

  if (nextStatus === ProgressStatus.NEW) {
    return {
      status: ProgressStatus.NEW,
      attempts: 0,
      lastAttemptedAt: null,
      solvedAt: null,
      changed: true,
    };
  }

  const enteredPractice = !isProblemStarted(existing.status);
  return {
    status: nextStatus,
    attempts: existing.attempts + (enteredPractice ? 1 : 0),
    lastAttemptedAt: now,
    solvedAt: existing.solvedAt ?? (isProblemComplete(nextStatus) ? now : null),
    changed: true,
  };
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

  return firstUncompleted;
}
