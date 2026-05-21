import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('dashboard page state coverage', ()=>{
  it('critical dashboard files exist and avoid local-path leaks in static copy', ()=>{
    const files = [
      'src/app/dashboard/page.tsx',
      'src/app/dashboard/content-history/page.tsx',
      'src/app/dashboard/ocr/page.tsx',
      'src/app/dashboard/templates/page.tsx',
    ];
    for (const f of files) {
      const text = fs.readFileSync(f,'utf8');
      expect(text.length).toBeGreaterThan(50);
      expect(text).not.toMatch(/\/home\/|\/var\/lib\/|\.env/i);
    }
  });
});
