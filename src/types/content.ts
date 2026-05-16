export type Platform =
  | "facebook"
  | "instagram"
  | "threads"
  | "x"
  | "blog"
  | "seo_article"
  | "comment"
  | "short_caption";

export interface GeneratedContent {
  platform: Platform;
  headline: string;
  caption: string;
  hashtags: string[];
  cta: string;
  affiliateDisclosure: string;
  warnings: string[];
}
