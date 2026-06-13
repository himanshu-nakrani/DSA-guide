import { describe, expect, it } from 'vitest';
import { pickNextProblem } from '../problem-progress';
import { ProgressStatus } from '@/generated/prisma';

describe('problem-progress', () => {
  describe('pickNextProblem', () => {
    const problems = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ];

    it('should pick first problem when nothing is started', () => {
      const progress = new Map();
      expect(pickNextProblem(problems, progress)).toEqual({ id: '1' });
    });

    it('should return null when array is empty', () => {
      const progress = new Map();
      expect(pickNextProblem([], progress)).toBeNull();
    });

    it('should pick first unstarted problem', () => {
      const progress = new Map();
      progress.set('1', ProgressStatus.SOLVED);
      expect(pickNextProblem(problems, progress)).toEqual({ id: '2' });
    });

    it('should pick first started but incomplete problem when all are started', () => {
      const progress = new Map();
      progress.set('1', ProgressStatus.SOLVED);
      progress.set('2', ProgressStatus.ATTEMPTED);
      progress.set('3', ProgressStatus.SOLVED);
      expect(pickNextProblem(problems, progress)).toEqual({ id: '2' });
    });

    it('should pick first problem when all are completed', () => {
      const progress = new Map();
      progress.set('1', ProgressStatus.SOLVED);
      progress.set('2', ProgressStatus.MASTERED);
      progress.set('3', ProgressStatus.SOLVED);
      expect(pickNextProblem(problems, progress)).toEqual({ id: '1' });
    });
  });
});
