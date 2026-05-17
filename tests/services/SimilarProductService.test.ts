import { describe, expect, it } from 'vitest';
import { SimilarProductService } from '@/services/SimilarProductService';

describe('SimilarProductService', () => {
  it('scores related products with non-zero similarity', () => {
    const service = new SimilarProductService() as any;
    const result = service.scorePair(
      {
        id: '1', userId: 'u', title: 'Wireless Mouse', category: 'Accessories',
        description: '2.4ghz ergonomic mouse', price: 499, currency: 'THB'
      },
      {
        id: '2', userId: 'u', title: 'Wireless Keyboard', category: 'Accessories',
        description: '2.4ghz compact keyboard', price: 599, currency: 'THB'
      }
    );

    expect(result.score).toBeGreaterThan(0);
    expect(result.sourceProductId).toBe('1');
    expect(result.relatedProductId).toBe('2');
  });
});
