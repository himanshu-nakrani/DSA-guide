import { describe, expect, it } from "vitest";
import { ProgressStatus } from "@/generated/prisma";
import {
  isProblemComplete,
  isProblemStarted,
  pickNextProblem,
  summarizeProblemProgress,
  transitionProblemProgress,
} from "./problem-progress";

describe("isProblemComplete", () => {
  it("returns true for SOLVED and MASTERED", () => {
    expect(isProblemComplete(ProgressStatus.SOLVED)).toBe(true);
    expect(isProblemComplete(ProgressStatus.MASTERED)).toBe(true);
  });

  it("returns false for other statuses or missing statuses", () => {
    expect(isProblemComplete(ProgressStatus.NEW)).toBe(false);
    expect(isProblemComplete(ProgressStatus.ATTEMPTED)).toBe(false);
    expect(isProblemComplete(ProgressStatus.NEEDS_REVISION)).toBe(false);
    expect(isProblemComplete(undefined)).toBe(false);
    expect(isProblemComplete(null)).toBe(false);
  });
});

describe("isProblemStarted", () => {
  it("returns true for statuses other than NEW, undefined, or null", () => {
    expect(isProblemStarted(ProgressStatus.ATTEMPTED)).toBe(true);
    expect(isProblemStarted(ProgressStatus.SOLVED)).toBe(true);
    expect(isProblemStarted(ProgressStatus.NEEDS_REVISION)).toBe(true);
    expect(isProblemStarted(ProgressStatus.MASTERED)).toBe(true);
  });

  it("returns false for NEW, undefined, or null", () => {
    expect(isProblemStarted(ProgressStatus.NEW)).toBe(false);
    expect(isProblemStarted(undefined)).toBe(false);
    expect(isProblemStarted(null)).toBe(false);
  });
});

describe("summarizeProblemProgress", () => {
  it("returns zeros for empty inputs", () => {
    expect(summarizeProblemProgress([], new Map())).toEqual({ total: 0, solved: 0, started: 0, percent: 0 });
  });

  it("handles duplicate problem IDs", () => {
    expect(summarizeProblemProgress(["p1", "p1"], new Map([["p1", ProgressStatus.SOLVED]]))).toEqual({
      total: 1,
      solved: 1,
      started: 1,
      percent: 100,
    });
  });

  it("correctly counts started and solved problems", () => {
    const progressMap = new Map([
      ["p1", ProgressStatus.NEW],
      ["p2", ProgressStatus.ATTEMPTED],
      ["p3", ProgressStatus.SOLVED],
      ["p4", ProgressStatus.MASTERED],
      ["p5", ProgressStatus.NEEDS_REVISION],
    ]);
    expect(summarizeProblemProgress(["p1", "p2", "p3", "p4", "p5", "p6"], progressMap)).toEqual({
      total: 6,
      solved: 2,
      started: 4,
      percent: 33,
    });
  });
});

describe("pickNextProblem", () => {
  it("returns the first unstarted problem if one exists", () => {
    const problems = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
    const progressMap = new Map([
      ["p1", ProgressStatus.SOLVED],
      ["p2", ProgressStatus.NEW],
      ["p3", ProgressStatus.ATTEMPTED],
    ]);
    expect(pickNextProblem(problems, progressMap)).toEqual({ id: "p2" });
  });

  it("returns the first started but incomplete problem if all are started", () => {
    const problems = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
    const progressMap = new Map([
      ["p1", ProgressStatus.SOLVED],
      ["p2", ProgressStatus.ATTEMPTED],
      ["p3", ProgressStatus.SOLVED],
    ]);
    expect(pickNextProblem(problems, progressMap)).toEqual({ id: "p2" });
  });

  it("returns null when every problem is complete", () => {
    const problems = [{ id: "p1" }, { id: "p2" }];
    const progressMap = new Map([
      ["p1", ProgressStatus.SOLVED],
      ["p2", ProgressStatus.MASTERED],
    ]);
    expect(pickNextProblem(problems, progressMap)).toBe(null);
  });

  it("returns null if the problem list is empty", () => {
    expect(pickNextProblem([], new Map())).toBe(null);
  });
});

describe("transitionProblemProgress", () => {
  const firstAttempt = new Date("2026-08-13T12:00:00.000Z");
  const completion = new Date("2026-08-13T12:05:00.000Z");

  it("creates a first attempt only when a learner enters active practice", () => {
    expect(transitionProblemProgress(null, ProgressStatus.NEW, firstAttempt)).toMatchObject({
      status: ProgressStatus.NEW,
      attempts: 0,
      lastAttemptedAt: null,
      solvedAt: null,
      changed: true,
    });
    expect(transitionProblemProgress(null, ProgressStatus.ATTEMPTED, firstAttempt)).toMatchObject({
      status: ProgressStatus.ATTEMPTED,
      attempts: 1,
      lastAttemptedAt: firstAttempt,
      solvedAt: null,
      changed: true,
    });
  });

  it("does not inflate attempts or timestamps for a repeated identical status", () => {
    const existing = {
      status: ProgressStatus.ATTEMPTED,
      attempts: 2,
      lastAttemptedAt: firstAttempt,
      solvedAt: null,
    };
    expect(transitionProblemProgress(existing, ProgressStatus.ATTEMPTED, completion)).toEqual({
      ...existing,
      changed: false,
    });
  });

  it("preserves the first completion timestamp across later solved-state updates", () => {
    const existing = {
      status: ProgressStatus.SOLVED,
      attempts: 1,
      lastAttemptedAt: firstAttempt,
      solvedAt: completion,
    };
    const later = new Date("2026-08-14T12:00:00.000Z");
    expect(transitionProblemProgress(existing, ProgressStatus.MASTERED, later)).toEqual({
      status: ProgressStatus.MASTERED,
      attempts: 1,
      lastAttemptedAt: later,
      solvedAt: completion,
      changed: true,
    });
  });

  it("resets explicit learner progress only when the learner chooses NEW", () => {
    const existing = {
      status: ProgressStatus.SOLVED,
      attempts: 3,
      lastAttemptedAt: firstAttempt,
      solvedAt: completion,
    };
    expect(transitionProblemProgress(existing, ProgressStatus.NEW, completion)).toEqual({
      status: ProgressStatus.NEW,
      attempts: 0,
      lastAttemptedAt: null,
      solvedAt: null,
      changed: true,
    });
  });
});
