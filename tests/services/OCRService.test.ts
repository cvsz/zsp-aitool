import { describe, expect, it, vi } from 'vitest';
import { OCRService } from '@/services/OCRService';

describe('OCRService', () => {
  it('uses mock OCR provider', async () => {
    const provider = { extractText: vi.fn().mockResolvedValue({ text: 'สินค้า', confidence: 0.9 }) };
    const service = new OCRService(provider);
    const out = await service.extract('http://image');
    expect(provider.extractText).toHaveBeenCalled();
    expect(out.text).toBe('สินค้า');
  });
});
