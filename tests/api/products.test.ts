import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/products/route';

describe('products route', () => {
  it('returns json response', async () => {
    const response = await GET();
    const body = await response.json();
    expect(body).toEqual({ data: [] });
  });
});
