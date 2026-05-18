export const hyperFrameAllowedMedia = ["image", "video", "none"] as const;
export type HyperFrameAllowedMedia = (typeof hyperFrameAllowedMedia)[number];

export type HyperFrameTemplateDisclosureRule = {
  code: "affiliate_disclosure" | "no_fake_results" | "no_unsupported_claims" | "no_fake_scarcity";
  required: boolean;
  description: string;
};

export type HyperFrameTemplateScene = {
  id: string;
  title: string;
  purpose: string;
  minSeconds: number;
  maxSeconds: number;
};

export type HyperFrameTemplate = {
  id: string;
  label: string;
  description: string;
  scenes: HyperFrameTemplateScene[];
  allowedMedia: readonly HyperFrameAllowedMedia[];
  durationRangeSeconds: { min: number; max: number };
  requiredDisclosureRules: HyperFrameTemplateDisclosureRule[];
};

export type HyperFrameTemplateMetadata = {
  templateId: string;
  templateVersion: "1.0.0";
  sceneCount: number;
  durationRangeSeconds: { min: number; max: number };
  allowedMedia: readonly HyperFrameAllowedMedia[];
  requiredDisclosureCodes: string[];
};
