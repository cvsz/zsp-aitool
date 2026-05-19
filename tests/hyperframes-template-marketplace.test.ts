import { describe, expect, it } from "vitest";

import { assertSafeTemplatePreset, hyperframesTemplatePresets, listTemplatePresets } from "@/lib/hyperframes/template-marketplace";

describe("hyperframes template marketplace", () => {
  it("includes required lite categories", () => {
    const categories = new Set(hyperframesTemplatePresets.map((item) => item.category));
    expect(categories.has("product_showcase")).toBe(true);
    expect(categories.has("discount_alert")).toBe(true);
    expect(categories.has("comparison")).toBe(true);
    expect(categories.has("testimonial_style")).toBe(true);
    expect(categories.has("social_short_cut")).toBe(true);
  });

  it("filters templates by query safely", () => {
    const results = listTemplatePresets("โปร", "discount_alert");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.category === "discount_alert")).toBe(true);
  });

  it("rejects unsafe token patterns", () => {
    expect(() => assertSafeTemplatePreset({ ...hyperframesTemplatePresets[0], scriptSeed: "use /var/lib and outputPath" })).toThrow("UNSAFE_TEMPLATE_CONTENT");
  });
});
