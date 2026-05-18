import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateHyperframesScript } from "@/services/hyperframes-script-service";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    hyperFrameScriptGeneration: { create: vi.fn(async (args: unknown) => args) },
  },
}));

const { prisma } = await import("@/lib/prisma");

describe("hyperframes script service", () => {
  beforeEach(() => vi.clearAllMocks());

  const baseInput = {
    productId: "p1",
    platform: "tiktok" as const,
    tone: "friendly",
    language: "mixed" as const,
    durationSeconds: 18,
    aspectRatio: "9:16" as const,
  };

  const baseProduct = {
    id: "p1",
    title: "Lamp",
    description: "portable lamp",
    price: "100",
    currency: "THB",
    category: "home",
    shopName: "Shop A",
    affiliateUrl: "https://aff.example",
  };

  it("persists script with owner scope", async () => {
    await generateHyperframesScript("u-1", baseInput, baseProduct);
    expect(prisma.hyperFrameScriptGeneration.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "u-1" }) }),
    );
  });

  it("includes disclosure beat when affiliate url exists", async () => {
    const data = await generateHyperframesScript("u-1", { ...baseInput, language: "th" }, baseProduct);
    expect(data.beats[data.beats.length - 1].type).toBe("disclosure");
    expect(data.disclosure).toBeTruthy();
  });

  it("blocks unsafe fake claims", async () => {
    await expect(
      generateHyperframesScript("u-1", { ...baseInput, language: "en" }, { ...baseProduct, description: "guaranteed 100% results" }),
    ).rejects.toThrow("UNSAFE_CLAIM_BLOCKED");
  });
});
