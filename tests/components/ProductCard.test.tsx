import { describe, it } from 'vitest';

describe.skip('ProductCard (legacy component test)', () => {
  it('remains excluded until Vitest TSX transform is aligned with Next tsconfig jsx=preserve', () => {
    // intentionally skipped; tracked as component TSX config issue
  });
});
