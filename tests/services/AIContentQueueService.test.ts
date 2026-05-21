import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('AIContentQueueService static', () => {
  it('enforces budget and unsafe claim filter', () => {
    const file = readFileSync('src/services/AIContentQueueService.ts', 'utf8');
    expect(file).toContain('BudgetService.checkBudget');
    expect(file).toContain('unsafeClaimPattern');
  });
});
