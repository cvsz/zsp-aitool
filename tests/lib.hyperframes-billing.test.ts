import { describe, it, expect } from "vitest";
import { enforceHyperFramesBilling } from "@/lib/hyperframes/billing";

describe("enforceHyperFramesBilling", () => {
  it("blocks unpaid plan", () => {
    const request = new Request("http://localhost", { headers: { "x-plan": "free", "x-hf-quota-remaining": "3" } }) as never;
    const result = enforceHyperFramesBilling(request, ["high_quality"]);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("UPGRADE_REQUIRED");
  });

  it("blocks when quota exceeded", () => {
    const request = new Request("http://localhost", { headers: { "x-plan": "pro", "x-hf-quota-remaining": "0" } }) as never;
    const result = enforceHyperFramesBilling(request, ["batch_render"]);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("QUOTA_EXCEEDED");
  });

  it("allows when paid plan has quota", () => {
    const request = new Request("http://localhost", { headers: { "x-plan": "pro", "x-hf-quota-remaining": "2" } }) as never;
    const result = enforceHyperFramesBilling(request, ["long_duration", "watermark_removal"]);
    expect(result.allowed).toBe(true);
  });
});
