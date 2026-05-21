import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

describe('product dedupe dashboard exists', () => {
  it('has dedupe page', () => {
    const content = fs.readFileSync('src/app/dashboard/products/deduplication/page.tsx', 'utf8');
    expect(content).toContain('จัดการสินค้าซ้ำ');
  });
});
