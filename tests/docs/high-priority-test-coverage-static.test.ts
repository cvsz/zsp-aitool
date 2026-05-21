import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('high priority coverage doc', ()=>{
  it('contains required sections', ()=>{
    const text = fs.readFileSync('docs/testing/high-priority-api-ui-coverage.md','utf8');
    expect(text).toContain('Coverage matrix');
    expect(text).toContain('/api/auth/register');
    expect(text).toContain('/api/templates');
    expect(text).toContain('/api/ocr/extract');
  });
});
