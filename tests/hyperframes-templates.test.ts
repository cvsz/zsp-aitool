import { describe, expect, it } from "vitest";

import { buildHyperFrameTemplateMetadata, getHyperFrameTemplateById, hyperFrameTemplates } from "@/lib/hyperframes/templates";

const REQUIRED_TEMPLATE_IDS = [
  "product-reveal",
  "problem-solution",
  "tutorial",
  "feature-highlight",
  "before-after-honest",
  "comparison-safe",
  "offer-cta-ethical",
] as const;

describe("hyperframes templates", () => {
  it("includes all required safe promo templates", () => {
    expect(hyperFrameTemplates.map((template) => template.id).sort()).toEqual([...REQUIRED_TEMPLATE_IDS].sort());
  });

  it.each(REQUIRED_TEMPLATE_IDS)("defines deterministic metadata for %s", (templateId) => {
    const template = getHyperFrameTemplateById(templateId);
    expect(template).not.toBeNull();
    expect(template?.scenes.length).toBeGreaterThan(0);
    expect(template?.allowedMedia.length).toBeGreaterThan(0);
    expect(template?.durationRangeSeconds.min).toBeGreaterThan(0);
    expect(template?.durationRangeSeconds.max).toBeGreaterThan(template?.durationRangeSeconds.min ?? 0);
    expect(template?.requiredDisclosureRules.length).toBeGreaterThan(0);

    for (const scene of template?.scenes ?? []) {
      expect(scene.minSeconds).toBeGreaterThan(0);
      expect(scene.maxSeconds).toBeGreaterThan(scene.minSeconds);
    }

    const metadataA = buildHyperFrameTemplateMetadata(templateId);
    const metadataB = buildHyperFrameTemplateMetadata(templateId);

    expect(metadataA).toEqual(metadataB);
    expect(metadataA?.templateVersion).toBe("1.0.0");
    expect(metadataA?.requiredDisclosureCodes).toEqual(
      [...(metadataA?.requiredDisclosureCodes ?? [])].sort(),
    );
  });

  it("returns null for unknown template metadata", () => {
    expect(buildHyperFrameTemplateMetadata("unknown")).toBeNull();
  });
});
