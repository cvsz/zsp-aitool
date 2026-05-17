import { describe, expect, it } from 'vitest';
import { PromptBuilder } from '@/services/ai/PromptBuilder';

describe('PromptBuilder', () => {
  it('contains affiliate disclosure rule', () => {
    const prompt = new PromptBuilder().build({ productTitle: 'Phone', platform: 'x', tone: 'casual', language: 'en' });
    expect(prompt).toContain('affiliate disclosure');
  });
});
