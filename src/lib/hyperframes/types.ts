export const hyperFrameAspectRatios = ["16:9", "9:16", "1:1"] as const;
export type HyperFrameAspectRatio = (typeof hyperFrameAspectRatios)[number];
export const hyperFramePlatforms = ["facebook", "instagram", "threads", "x", "blog"] as const;
export type HyperFramePlatform = (typeof hyperFramePlatforms)[number];
export type HyperFrameCompositionRequest = { productId: string; platform: HyperFramePlatform; aspectRatio: HyperFrameAspectRatio; durationSeconds: number; caption: string; };
export type HyperFrameCompositionResult = { compositionId: string; compositionHtml: string; metadata: { productId: string; productTitle: string; platform: HyperFramePlatform; aspectRatio: HyperFrameAspectRatio; durationSeconds: number; width: number; height: number; hasAffiliateDisclosure: boolean; }; };
