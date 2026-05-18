import { describe, expect, it } from "vitest";
import { resolveRenderQuality } from "@/lib/hyperframes/render-quality";

describe("render quality profiles", () => {
  it("defaults to standard", () => {
    const result = resolveRenderQuality(undefined, { allowedRaw: "preview,standard,high", highQualityEnabled: true });
    expect(result.profile).toBe("standard");
  });

  it("rejects invalid profile", () => {
    expect(() =>
      resolveRenderQuality("high", { allowedRaw: "preview,standard", highQualityEnabled: true }),
    ).toThrow(/not allowed/);
  });

  it("gates high profile", () => {
    expect(() =>
      resolveRenderQuality("high", { allowedRaw: "preview,standard,high", highQualityEnabled: false }),
    ).toThrow(/disabled/);
  });
});
