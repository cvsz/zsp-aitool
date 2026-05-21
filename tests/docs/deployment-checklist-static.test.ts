import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('deployment checklist runbook', () => {
  it('includes backup and rollback coverage', () => {
    const content = readFileSync('docs/runbooks/production-deployment-checklist.md', 'utf8');
    expect(content).toMatch(/backup/i);
    expect(content).toMatch(/rollback/i);
    expect(content).toContain('npx prisma migrate deploy');
    expect(content).toContain('npm run health');
  });
});
