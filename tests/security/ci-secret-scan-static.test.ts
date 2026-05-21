import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';

describe('ci secret scan and local preflight', () => {
  it('has executable local preflight script', () => {
    const path = 'scripts/ci/local-preflight.sh';
    expect(existsSync(path)).toBe(true);
    expect((statSync(path).mode & 0o111) > 0).toBe(true);
  });

  it('security workflow enforces no .env committed and static scans', () => {
    const content = readFileSync('.github/workflows/security.yml', 'utf8');
    expect(content).toContain('Ensure .env is not committed');
    expect(content).toContain('Static secret and path leak scan');
    expect(content).toContain('npm audit --audit-level=high');
  });
});
