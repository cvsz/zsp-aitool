import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('queue redaction static', () => {
  it('uses safe shaped internal errors', () => {
    const file = readFileSync('src/app/api/ai/content-queue/route.ts', 'utf8');
    expect(file).toContain('INTERNAL_ERROR');
    expect(file).not.toContain('DATABASE_URL');
  });
});
