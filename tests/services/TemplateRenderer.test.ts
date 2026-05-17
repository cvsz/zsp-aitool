import { describe, expect, it } from 'vitest';
import { TemplateRenderer } from '@/services/TemplateRenderer';

describe('TemplateRenderer', () => {
  it('replaces variables', () => {
    expect(new TemplateRenderer().render('Hi {{name}}', { name: 'Zea' })).toBe('Hi Zea');
  });
});
