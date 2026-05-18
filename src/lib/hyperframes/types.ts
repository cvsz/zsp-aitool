export const hyperFrameAspectRatios = ["16:9", "9:16", "1:1"] as const;
export type HyperFrameAspectRatio = (typeof hyperFrameAspectRatios)[number];

export const hyperFramePlatforms = ["facebook", "instagram", "threads", "x", "blog"] as const;
export type HyperFramePlatform = (typeof hyperFramePlatforms)[number];

export const HYPERFRAME_MIN_DURATION_SECONDS = 3;
export const HYPERFRAME_MAX_DURATION_SECONDS = 60;
export const HYPERFRAME_MAX_TEXT_LENGTH = 1200;

export type HyperFrameCompositionRequest = {
  productId: string;
  platform: HyperFramePlatform;
  aspectRatio: HyperFrameAspectRatio;
  durationSeconds: number;
  caption?: string;
  script?: string;
};

export type HyperFrameBrandKit = {
  brandColors?: string[];
  fontPreference?: string | null;
  logoUrl?: string | null;
  watermarkText?: string | null;
  defaultCTA?: string | null;
};

export type HyperFrameCompositionProduct = {
  title: string;
  price?: string | null;
  currency?: string | null;
  imageUrl?: string | null;
  affiliateUrl?: string | null;
};

export type HyperFrameCompositionResult = {
  compositionId: string;
  compositionHtml: string;
  metadata: {
    productId: string;
    productTitle: string;
    platform: HyperFramePlatform;
    aspectRatio: HyperFrameAspectRatio;
    durationSeconds: number;
    width: number;
    height: number;
    hasAffiliateDisclosure: boolean;
  };
};
