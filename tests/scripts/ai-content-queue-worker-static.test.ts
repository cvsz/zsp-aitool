import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('ai worker static', () => {
  it('uses claimPending and processJob', () => {
    const file = readFileSync('scripts/ai/content-queue-worker.ts', 'utf8');
    expect(file).toContain('claimPending');
    expect(file).toContain('processJob');
  });
});
