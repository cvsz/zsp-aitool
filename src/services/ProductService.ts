export interface ProductRecord { id: string; userId: string; title: string; originalUrl: string; price?: number | null; }
export interface ProductRepository { product: { findFirst:(args: unknown)=>Promise<ProductRecord|null>; create:(args: unknown)=>Promise<ProductRecord>; findMany:(args: unknown)=>Promise<ProductRecord[]>; }; }
export class ProductService { constructor(private readonly repo: ProductRepository) {}
async create(input: Omit<ProductRecord,'id'>){ const exists=await this.repo.product.findFirst({where:{userId:input.userId,originalUrl:input.originalUrl}}); if(exists) throw new Error('Duplicate product URL for this user'); return this.repo.product.create({data:input}); }
async listByUser(userId:string){ return this.repo.product.findMany({where:{userId}}); }}
