import { describe, expect, it, vi } from 'vitest';
import { AIContentService } from '@/services/AIContentService';

describe('AIContentService', () => {
  it('uses mock AI provider', async () => {
    const provider = { generate: vi.fn().mockResolvedValue({ caption: 'ok' }) };
    const service = new AIContentService(provider);
    const out = await service.generateContent({ productTitle: 'Lamp', platform: 'facebook', tone: 'friendly', language: 'th' });
    expect(provider.generate).toHaveBeenCalled();
    expect(out.caption).toBe('ok');
  });
});
