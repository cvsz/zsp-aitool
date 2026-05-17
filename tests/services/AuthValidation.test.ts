import { describe, expect, it } from 'vitest';
import { validateSession } from '@/lib/auth';

describe('Auth validation', () => {
  it('returns true for valid session', () => {
    expect(validateSession({ userId: 'user-1' })).toBe(true);
  });

  it('returns false when no user id', () => {
    expect(validateSession({})).toBe(false);
  });
});
