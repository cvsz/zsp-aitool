import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => {
  const create = vi.fn().mockResolvedValue({ id: 'job-1', status: 'PROCESSING' });
  const update = vi
    .fn()
    .mockResolvedValueOnce({ id: 'job-1', status: 'COMPLETED', extractedText: '{"text":"สินค้า","confidence":0.9}', errorMessage: null })
    .mockResolvedValueOnce({ id: 'job-1', status: 'FAILED', extractedText: null, errorMessage: 'boom' });
  const findFirst = vi.fn().mockResolvedValue({ id: 'job-1', status: 'COMPLETED', extractedText: '{"text":"สินค้า","confidence":0.9}', errorMessage: null });

  return { prisma: { oCRJob: { create, update, findFirst } } };
});

import { OCRService } from '@/services/OCRService';

describe('OCRService', () => {
  it('extracts and saves OCR result', async () => {
    const provider = { extract: vi.fn().mockResolvedValue({ text: 'สินค้า', confidence: 0.9 }) };
    const service = new OCRService(provider as any);
    const out = await service.extractAndSave('u1', { imageBase64: 'abcd', mimeType: 'image/png' });

    expect(provider.extract).toHaveBeenCalled();
    expect(out.result.text).toBe('สินค้า');
  });

  it('reads saved OCR job', async () => {
    const service = new OCRService({ extract: vi.fn() } as any);
    const job = await service.getJob('u1', 'job-1');

    expect(job.status).toBe('COMPLETED');
    expect(job.result?.text).toBe('สินค้า');
  });
});
