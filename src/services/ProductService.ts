export interface ProductRecord { id: string; userId: string; title: string; originalUrl: string; price?: number | null; }
export interface ProductRepository { product: { findFirst:(args: unknown)=>Promise<ProductRecord|null>; create:(args: unknown)=>Promise<ProductRecord>; findMany:(args: unknown)=>Promise<ProductRecord[]>; }; }
export class ProductService { constructor(private readonly repo: ProductRepository) {}
async create(input: Omit<ProductRecord,'id'>){ const exists=await this.repo.product.findFirst({where:{userId:input.userId,originalUrl:input.originalUrl}}); if(exists) throw new Error('Duplicate product URL for this user'); return this.repo.product.create({data:input}); }
async listByUser(userId:string){ return this.repo.product.findMany({where:{userId}}); }}
import { AppError } from "../lib/errors";
import type { CreateProductInput, UpdateProductInput } from "../schemas/product.schema";

export interface ProductRecord extends CreateProductInput {
  id: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

class ProductService {
  private products = new Map<string, ProductRecord>();

  list() {
    return Array.from(this.products.values()).filter((p) => !p.deletedAt);
  }

  getById(id: string) {
    const product = this.products.get(id);
    if (!product || product.deletedAt) throw new AppError("NOT_FOUND", "Product not found", 404);
    return product;
  }

  create(input: CreateProductInput) {
    this.ensureNoDuplicateUrl(input.originalUrl);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const product: ProductRecord = { ...input, id, deletedAt: null, createdAt: now, updatedAt: now };
    this.products.set(id, product);
    return product;
  }

  update(id: string, input: UpdateProductInput) {
    const existing = this.getById(id);
    if (input.originalUrl && input.originalUrl !== existing.originalUrl) this.ensureNoDuplicateUrl(input.originalUrl, id);
    const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
    this.products.set(id, updated);
    return updated;
  }

  softDelete(id: string) {
    const existing = this.getById(id);
    const now = new Date().toISOString();
    existing.deletedAt = now;
    existing.updatedAt = now;
    this.products.set(id, existing);
  }

  importByUrl(originalUrl: string) {
    const duplicate = this.findByOriginalUrl(originalUrl);
    if (duplicate) return { duplicate: true, product: duplicate };
    return { duplicate: false, draft: { originalUrl, note: "Please confirm or fill product details manually." } };
  }

  importFromExtension(payload: { title: string; originalUrl: string; price?: number; currency?: string; shopName?: string; description?: string; images?: string[]; visibleDataOnly: true; }) {
    return this.create({
      title: payload.title,
      originalUrl: payload.originalUrl,
      price: payload.price ?? 0,
      currency: payload.currency ?? "THB",
      shopName: payload.shopName,
      description: payload.description,
      images: payload.images ?? [],
    });
  }

  importJson(products: CreateProductInput[]) {
    return products.map((p) => {
      const duplicate = this.findByOriginalUrl(p.originalUrl);
      return duplicate ? this.update(duplicate.id, p) : this.create(p);
    });
  }

  updateAffiliateLink(id: string, affiliateUrl: string) {
    return this.update(id, { affiliateUrl });
  }

  private findByOriginalUrl(originalUrl: string) {
    return this.list().find((p) => p.originalUrl === originalUrl);
  }

  private ensureNoDuplicateUrl(originalUrl: string, ignoreId?: string) {
    const duplicate = this.list().find((p) => p.originalUrl === originalUrl && p.id !== ignoreId);
    if (duplicate) throw new AppError("DUPLICATE_URL", "Product with this originalUrl already exists", 409);
  }
}

const globalState = globalThis as unknown as { productService?: ProductService };
export const productService = globalState.productService ?? new ProductService();
if (!globalState.productService) globalState.productService = productService;
