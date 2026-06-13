import { vi, describe, it, expect } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {},
}));

import { hashPassword, verifyPassword } from './auth';

describe('auth.ts password functions', () => {
  describe('hashPassword', () => {
    it('generates a string with salt and hash separated by a colon', () => {
      const password = 'my-secret-password';
      const result = hashPassword(password);

      expect(typeof result).toBe('string');
      expect(result).toContain(':');

      const parts = result.split(':');
      expect(parts.length).toBe(2);

      const [salt, hash] = parts;
      expect(salt.length).toBeGreaterThan(0);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('generates different hashes for the same password due to random salting', () => {
      const password = 'my-secret-password';
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).not.toBe(hash2);

      const [salt1] = hash1.split(':');
      const [salt2] = hash2.split(':');
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for a correct password', () => {
      const password = 'my-secret-password';
      const storedHash = hashPassword(password);

      const isValid = verifyPassword(password, storedHash);
      expect(isValid).toBe(true);
    });

    it('returns false for an incorrect password', () => {
      const password = 'my-secret-password';
      const wrongPassword = 'wrong-password';
      const storedHash = hashPassword(password);

      const isValid = verifyPassword(wrongPassword, storedHash);
      expect(isValid).toBe(false);
    });

    it('returns false when verifying against an invalid hash format', () => {
      const password = 'my-secret-password';

      expect(verifyPassword(password, 'invalid-hash-without-colon')).toBe(false);
      expect(verifyPassword(password, ':only-hash')).toBe(false);
      expect(verifyPassword(password, 'only-salt:')).toBe(false);
      expect(verifyPassword(password, '')).toBe(false);
    });

    it('returns false when hash lengths do not match', () => {
      const password = 'my-secret-password';
      const validHash = hashPassword(password);
      const [salt] = validHash.split(':');

      // Construct a fake storedHash with a smaller length hash
      // derived.length will be 64 since PASSWORD_KEYLEN = 64
      const wrongLengthHash = Buffer.from('a'.repeat(32)).toString('hex');

      expect(verifyPassword(password, `${salt}:${wrongLengthHash}`)).toBe(false);
    });
  });
});
