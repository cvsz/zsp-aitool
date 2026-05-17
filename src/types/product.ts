export type ImportStatus = "pending" | "completed" | "failed" | "needs_review";

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface ProductInput {
  title: string;
  price: number;
  currency: string;
  originalUrl: string;
  affiliateUrl?: string;
  shopName?: string;
  rating?: number;
  soldCount?: number;
  description?: string;
  category?: string;
  images?: ProductImage[];
  rawMetadata?: Record<string, unknown>;
}

export interface Product extends ProductInput {
  id: string;
  slug: string;
  importStatus: ImportStatus;
  createdAt: string;
  updatedAt: string;
}
