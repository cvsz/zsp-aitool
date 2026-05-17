import { describe, expect, it } from 'vitest';
import { SimilarProductService } from '@/services/SimilarProductService';

describe('SimilarProductService', () => {
  it('scores overlap keywords', () => {
    const score = new SimilarProductService().score({ id: '1', userId: 'u', title: 'Wireless Mouse', originalUrl: 'a' }, { id: '2', userId: 'u', title: 'Wireless Keyboard', originalUrl: 'b' });
    expect(score).toBeGreaterThan(0);
  });
});
