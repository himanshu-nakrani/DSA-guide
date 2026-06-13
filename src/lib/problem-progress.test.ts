import { summarizeProblemProgress, isProblemComplete, isProblemStarted, pickNextProblem } from './problem-progress';
import { ProgressStatus } from '@/generated/prisma';
import { describe, it, expect } from 'vitest';

describe('isProblemComplete', () => {
  it('returns true for SOLVED and MASTERED', () => {
    expect(isProblemComplete(ProgressStatus.SOLVED)).toBe(true);
    expect(isProblemComplete(ProgressStatus.MASTERED)).toBe(true);
  });

  it('returns false for other statuses or missing statuses', () => {
    expect(isProblemComplete(ProgressStatus.NEW)).toBe(false);
    expect(isProblemComplete(ProgressStatus.ATTEMPTED)).toBe(false);
    expect(isProblemComplete(ProgressStatus.NEEDS_REVISION)).toBe(false);
    expect(isProblemComplete(undefined)).toBe(false);
    expect(isProblemComplete(null)).toBe(false);
  });
});

describe('isProblemStarted', () => {
  it('returns true for statuses other than NEW, undefined, or null', () => {
    expect(isProblemStarted(ProgressStatus.ATTEMPTED)).toBe(true);
    expect(isProblemStarted(ProgressStatus.SOLVED)).toBe(true);
    expect(isProblemStarted(ProgressStatus.NEEDS_REVISION)).toBe(true);
    expect(isProblemStarted(ProgressStatus.MASTERED)).toBe(true);
  });

  it('returns false for NEW, undefined, or null', () => {
    expect(isProblemStarted(ProgressStatus.NEW)).toBe(false);
    expect(isProblemStarted(undefined)).toBe(false);
    expect(isProblemStarted(null)).toBe(false);
  });
});

describe('summarizeProblemProgress', () => {
  it('returns zeros for empty inputs', () => {
    const result = summarizeProblemProgress([], new Map());
    expect(result).toEqual({
      total: 0,
      solved: 0,
      started: 0,
      percent: 0,
    });
  });

  it('handles duplicate problem IDs', () => {
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED]
    ]);
    const result = summarizeProblemProgress(['p1', 'p1'], progressMap);
    expect(result).toEqual({
      total: 1,
      solved: 1,
      started: 1,
      percent: 100,
    });
  });

  it('correctly counts started and solved problems', () => {
    const progressMap = new Map([
      ['p1', ProgressStatus.NEW], // Neither started nor solved
      ['p2', ProgressStatus.ATTEMPTED], // Started, not solved
      ['p3', ProgressStatus.SOLVED], // Started and solved
      ['p4', ProgressStatus.MASTERED], // Started and solved
      ['p5', ProgressStatus.NEEDS_REVISION], // Started, not solved
      // p6 is undefined in map (neither)
    ]);

    const result = summarizeProblemProgress(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], progressMap);

    expect(result).toEqual({
      total: 6,
      solved: 2, // p3, p4
      started: 4, // p2, p3, p4, p5
      percent: Math.round((2 / 6) * 100), // 33
    });
  });

  it('calculates percentages correctly without exceeding 100%', () => {
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED],
      ['p2', ProgressStatus.MASTERED],
      ['p3', ProgressStatus.SOLVED],
    ]);
    const result = summarizeProblemProgress(['p1', 'p2', 'p3'], progressMap);
    expect(result).toEqual({
      total: 3,
      solved: 3,
      started: 3,
      percent: 100,
    });
  });

  it('calculates partial percentages rounding correctly', () => {
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED],
      ['p2', ProgressStatus.SOLVED],
      ['p3', ProgressStatus.NEW],
    ]);
    const result = summarizeProblemProgress(['p1', 'p2', 'p3'], progressMap);
    // 2/3 = 66.666... -> 67
    expect(result).toEqual({
      total: 3,
      solved: 2,
      started: 2,
      percent: 67,
    });
  });
});

describe('pickNextProblem', () => {
  it('returns the first unstarted problem if one exists', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED],
      ['p2', ProgressStatus.NEW],
      ['p3', ProgressStatus.ATTEMPTED],
    ]);

    expect(pickNextProblem(problems, progressMap)).toEqual({ id: 'p2' });
  });

  it('returns the first started but incomplete problem if all are started', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED],
      ['p2', ProgressStatus.ATTEMPTED],
      ['p3', ProgressStatus.SOLVED],
    ]);

    expect(pickNextProblem(problems, progressMap)).toEqual({ id: 'p2' });
  });

  it('returns the first problem if all are complete', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }];
    const progressMap = new Map([
      ['p1', ProgressStatus.SOLVED],
      ['p2', ProgressStatus.MASTERED],
    ]);

    expect(pickNextProblem(problems, progressMap)).toEqual({ id: 'p1' });
  });

  it('returns null if problem list is empty', () => {
    expect(pickNextProblem([], new Map())).toBe(null);
  });

  it('prioritizes unstarted over incomplete', () => {
    const problems = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
    const progressMap = new Map([
      ['p1', ProgressStatus.ATTEMPTED],
      ['p2', ProgressStatus.NEW],
      ['p3', ProgressStatus.NEEDS_REVISION],
    ]);

    expect(pickNextProblem(problems, progressMap)).toEqual({ id: 'p2' });
  });
});
