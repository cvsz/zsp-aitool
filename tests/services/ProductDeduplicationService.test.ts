import { describe, it, expect } from 'vitest';
import { ProductDeduplicationService } from '@/services/ProductDeduplicationService';

describe('ProductDeduplicationService', () => {
  const svc = new ProductDeduplicationService();
  it('normalizes url', () => {
    expect(svc.normalizeUrl('https://Shopee.co.th/a?utm_source=x#z')).toBe('https://shopee.co.th/a');
  });
  it('extracts item id', () => {
    expect(svc.extractShopeeItemId('https://shopee.co.th/product-name-i.111.222')).toBe('222');
  });
});
