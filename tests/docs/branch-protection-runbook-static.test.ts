import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('branch protection runbook', () => {
  it('lists required checks and protections', () => {
    const content = readFileSync('docs/runbooks/github-branch-protection.md', 'utf8');
    expect(content).toContain('ci / validate');
    expect(content).toContain('ci / build');
    expect(content).toContain('security / static scan');
    expect(content).toContain('release-check');
    expect(content).toMatch(/Require a pull request/i);
    expect(content).toMatch(/Disallow force pushes/i);
  });
});
