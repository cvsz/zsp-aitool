import { describe, expect, it } from 'vitest';
import { PromptBuilder } from '@/services/ai/PromptBuilder';

describe('PromptBuilder', () => {
  it('builds prompt with disclosure and platform guidance', () => {
    const prompt = PromptBuilder.build({
      product: {
        title: 'Phone',
        description: 'Great camera',
        price: 3990,
        currency: 'THB',
        category: 'Electronics'
      },
      platform: 'x',
      tone: 'casual',
      language: 'en',
      versions: 1,
      contentLength: 'short',
      affiliateDisclosure: '#ad'
    });

    expect(prompt).toContain('Must include affiliate disclosure: "#ad"');
    expect(prompt).toContain('Platform: x');
    expect(prompt).toContain('Return JSON array only.');
  });
});
