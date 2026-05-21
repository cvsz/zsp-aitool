import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('ai content queue routes static', () => {
  it('requires auth middleware', () => {
    expect(readFileSync('src/app/api/ai/content-queue/route.ts', 'utf8')).toContain('withAuth');
    expect(readFileSync('src/app/api/ai/content-queue/[id]/route.ts', 'utf8')).toContain('withAuth');
  });

  it('uses Next.js 15 async params typing for dynamic routes', () => {
    const byId = readFileSync('src/app/api/ai/content-queue/[id]/route.ts', 'utf8');
    const retry = readFileSync('src/app/api/ai/content-queue/[id]/retry/route.ts', 'utf8');
    const cancel = readFileSync('src/app/api/ai/content-queue/[id]/cancel/route.ts', 'utf8');
    expect(byId).toContain('context: { params: Promise<{ id: string }> }');
    expect(retry).toContain('context: { params: Promise<{ id: string }> }');
    expect(cancel).toContain('context: { params: Promise<{ id: string }> }');
    expect(byId).toContain('await context.params');
  });

  it('keeps AIContentQueueJob model in prisma schema', () => {
    const schema = readFileSync('prisma/schema.prisma', 'utf8');
    expect(schema).toContain('model AIContentQueueJob');
    expect(schema).toContain('aiContentQueueJobs AIContentQueueJob[]');
    expect(schema).toContain('maxAttempts Int       @default(3)');
  });
});
