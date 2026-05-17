export type SocialPlatform = "facebook" | "instagram" | "x" | "threads";

export interface ProductDraft {
  title: string;
  price: string;
  imageUrls: string[];
  rating?: string;
  soldCount?: string;
  description?: string;
  pageUrl: string;
}

export interface ExtensionSettings {
  apiEndpoint: string;
  apiToken: string;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
