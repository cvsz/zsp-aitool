export type Platform =
  | "facebook"
  | "instagram"
  | "threads"
  | "x"
  | "blog"
  | "seo_article"
  | "comment"
  | "short_caption";

export type ContentTone = "casual" | "friendly" | "professional" | "excited";
export type ContentLanguage = "th" | "en";
export type ContentStatus = "queued" | "success" | "failed";

export interface GeneratedContent {
  platform: Platform;
  headline: string;
  caption: string;
  hashtags: string[];
  cta: string;
  affiliateDisclosure: string;
  warnings: string[];
}

export interface ContentGeneration {
  id: string;
  productId: string;
  platform: Platform;
  tone: ContentTone;
  language: ContentLanguage;
  prompt: string;
  output: GeneratedContent;
  tokenUsage?: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
