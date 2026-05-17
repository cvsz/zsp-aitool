import type { ProductRecord } from '@/services/ProductService';
export function ProductCard({ product }: { product: ProductRecord }) { return <article><h3>{product.title}</h3><a href={product.originalUrl}>View product</a></article>; }
