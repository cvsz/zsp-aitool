import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('dedupe isolation static checks', () => {
  it('service scopes by userId', () => {
    const content = fs.readFileSync('src/services/ProductDeduplicationService.ts', 'utf8');
    expect(content).toContain('where: { userId');
  });
});
