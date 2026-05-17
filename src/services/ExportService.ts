import type { ProductRecord } from './ProductService';
export class ExportService { productsToCsv(products:ProductRecord[]){ const rows=['id,title,originalUrl']; for(const p of products){ rows.push(`${p.id},${p.title},${p.originalUrl}`);} return rows.join('\n'); }}
