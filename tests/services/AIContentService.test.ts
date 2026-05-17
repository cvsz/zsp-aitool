import { describe, expect, it, vi } from "vitest";
import { AIContentService } from "@/services/AIContentService";

describe("AIContentService", () => {
  it("includes affiliate disclosure guardrail when affiliateUrl exists", async () => {
    const provider = { generate: vi.fn().mockResolvedValue([{ caption: "ok" }]) };
    const service = new AIContentService(provider as any);
    await service.generate({
      platform: "facebook",
      tone: "friendly",
      language: "th",
      versions: 1,
      contentLength: "medium",
      product: { title: "Lamp", price: 100, currency: "THB", affiliateUrl: "https://aff" },
    });
    const prompt = provider.generate.mock.calls[0][0].prompt as string;
    expect(prompt).toContain("Include clear affiliate disclosure");
  });
});
