import { Difficulty, ProgressStatus } from "@/generated/prisma";

export const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const difficultyClass: Record<Difficulty, string> = {
  EASY: "pill border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
  MEDIUM: "pill border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-300",
  HARD: "pill border-rose-500/30 bg-rose-500/8 text-rose-700 dark:text-rose-300",
};

export const progressLabel: Record<ProgressStatus, string> = {
  NEW: "New",
  ATTEMPTED: "Attempted",
  SOLVED: "Solved",
  NEEDS_REVISION: "Needs revision",
  MASTERED: "Mastered",
};

export const progressOptions: ProgressStatus[] = [
  ProgressStatus.NEW,
  ProgressStatus.ATTEMPTED,
  ProgressStatus.SOLVED,
  ProgressStatus.NEEDS_REVISION,
  ProgressStatus.MASTERED,
];
