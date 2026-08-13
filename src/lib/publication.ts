import "server-only";

import { ProblemStatus } from "@/generated/prisma";

/**
 * The only problem state that may be exposed or mutated through learner-facing
 * routes. Keeping this predicate in one place prevents public query paths from
 * drifting apart when new problem surfaces are added.
 */
export const PUBLIC_PROBLEM_STATUS = ProblemStatus.PUBLISHED;

export function publicProblemWhere(slug?: string) {
  return {
    status: PUBLIC_PROBLEM_STATUS,
    ...(slug ? { slug } : {}),
  };
}
