import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('ai content queue routes static', () => {
  it('requires auth middleware', () => {
    expect(readFileSync('src/app/api/ai/content-queue/route.ts', 'utf8')).toContain('withAuth');
    expect(readFileSync('src/app/api/ai/content-queue/[id]/route.ts', 'utf8')).toContain('withAuth');
  });
});
