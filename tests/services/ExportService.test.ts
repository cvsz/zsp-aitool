import { describe, expect, it } from 'vitest';
import { ExportService } from '@/services/ExportService';

describe('ExportService', () => {
  it('exports products to csv', () => {
    const csv = new ExportService().productsToCsv([{ id: '1', userId: 'u', title: 'A', originalUrl: 'url' }]);
    expect(csv).toContain('id,title,originalUrl');
  });
});
