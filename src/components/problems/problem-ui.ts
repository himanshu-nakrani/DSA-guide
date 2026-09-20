import { Difficulty, ProgressStatus } from "@/generated/prisma";

export const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const difficultyClass: Record<Difficulty, string> = {
  EASY: "pill border-ink-green/40 bg-ink-green-wash text-ink-green",
  MEDIUM: "pill border-ink-ochre/40 bg-ink-ochre-wash text-ink-ochre",
  HARD: "pill border-ink-red/40 bg-ink-red-wash text-ink-red",
};

export const progressLabel: Record<ProgressStatus, string> = {
  NEW: "New",
  ATTEMPTED: "In progress",
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
