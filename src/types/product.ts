export type ImportStatus = "pending" | "completed" | "failed" | "needs_review";

export interface ProductInput {
  title: string;
  price: number;
  currency: string;
  originalUrl: string;
  description?: string;
  imageUrls?: string[];
  rawMetadata?: Record<string, unknown>;
}

export interface Product extends ProductInput {
  id: string;
  slug: string;
  importStatus: ImportStatus;
  createdAt: string;
  updatedAt: string;
}
