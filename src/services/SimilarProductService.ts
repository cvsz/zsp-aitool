import type { ProductRecord } from './ProductService';
export class SimilarProductService { score(source:ProductRecord,candidate:ProductRecord){ const s=new Set(source.title.toLowerCase().split(/\s+/)); const c=new Set(candidate.title.toLowerCase().split(/\s+/)); let o=0; s.forEach(t=>{if(c.has(t)) o+=1;}); return Math.min(100,Math.round((o/Math.max(1,s.size))*100)); }}
