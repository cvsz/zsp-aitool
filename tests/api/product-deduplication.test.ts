import { describe, it, expect } from 'vitest';
import { GET as getGroups } from '@/app/api/products/deduplication/groups/route';

describe('product deduplication api shape', () => {
  it('exports GET handler', () => {
    expect(typeof getGroups).toBe('function');
  });
});
