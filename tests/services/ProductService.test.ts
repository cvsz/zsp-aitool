import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const findFirst = vi.fn().mockResolvedValue(null);
  const create = vi.fn().mockImplementation(async ({ data }) => ({ id: '1', ...data, images: data.images.create }));
  return {
    prisma: {
      product: { findFirst, create },
      productImage: { updateMany: vi.fn() }
    }
  };
});

import { ProductService } from '@/services/ProductService';

describe('ProductService', () => {
  it('creates product with current API signature', async () => {
    const service = new ProductService();
    const result = await service.create('u1', {
      title: 'A',
      originalUrl: 'https://example.com/item',
      price: 10,
      currency: 'THB',
      images: ['https://example.com/a.jpg']
    } as any);

    expect(result.id).toBe('1');
    expect(result.userId).toBe('u1');
  });
});
