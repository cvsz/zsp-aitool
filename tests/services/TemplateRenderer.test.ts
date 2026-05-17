import { describe, expect, it } from 'vitest';
import { TemplateRenderer } from '@/services/TemplateRenderer';

describe('TemplateRenderer', () => {
  it('replaces known variables and keeps unknown placeholders', () => {
    expect(TemplateRenderer.render('Hi {{productTitle}} {{x}}', { productTitle: 'Zea' })).toBe('Hi Zea {{x}}');
  });

  it('extracts only supported variables used in template', () => {
    const variables = TemplateRenderer.variablesUsed('A {{productTitle}} {{price}} {{unknown}}');
    expect(variables).toContain('{{productTitle}}');
    expect(variables).toContain('{{price}}');
    expect(variables).not.toContain('{{unknown}}');
  });
});
