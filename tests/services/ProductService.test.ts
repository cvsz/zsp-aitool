import { describe, expect, it, vi } from 'vitest';
import { ProductService } from '@/services/ProductService';

describe('ProductService', () => {
  it('creates product when not duplicate', async () => {
    const repo = { product: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: '1', userId: 'u1', title: 'A', originalUrl: 'x' }), findMany: vi.fn() } };
    const service = new ProductService(repo as never);
    const result = await service.create({ userId: 'u1', title: 'A', originalUrl: 'x' });
    expect(result.id).toBe('1');
  });
});
