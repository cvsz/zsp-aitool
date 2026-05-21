import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const workflows = [
  '.github/workflows/ci.yml',
  '.github/workflows/security.yml',
  '.github/workflows/build.yml',
  '.github/workflows/release-check.yml'
];

describe('github actions hardening', () => {
  it('has required workflows', () => {
    for (const workflow of workflows) {
      expect(existsSync(workflow)).toBe(true);
    }
  });

  it('ci workflow runs typecheck test build', () => {
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
    expect(ci).toContain('npm run typecheck');
    expect(ci).toContain('npm run test');
    expect(ci).toContain('npm run build');
  });

  it('does not print env wholesale and avoids destructive db commands', () => {
    for (const workflow of workflows) {
      const content = readFileSync(workflow, 'utf8');
      expect(content).not.toMatch(/printenv|env\s*$|set\s*-x/m);
      expect(content).not.toMatch(/prisma\s+migrate\s+reset|drop\s+database|db\s+push\s+--force-reset/i);
    }
  });
});
