import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST as postVariants } from "@/app/api/hyperframes/variants/route";

vi.mock("@/lib/auth", () => ({ getSessionFromRequest: vi.fn() }));
vi.mock("@/services/hyperframes-variants-service", () => ({ generatePlatformVariants: vi.fn() }));

const { getSessionFromRequest } = await import("@/lib/auth");
const { generatePlatformVariants } = await import("@/services/hyperframes-variants-service");

describe("hyperframes variants api", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unauth blocked", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce(null);
    const res = await postVariants(new NextRequest("http://localhost/api/hyperframes/variants", { method: "POST", body: "{}" }) as never);
    expect(res.status).toBe(401);
  });

  it("cross-user blocked", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValueOnce({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    vi.mocked(generatePlatformVariants).mockRejectedValueOnce(new Error("PRODUCT_NOT_FOUND"));
    const res = await postVariants(new NextRequest("http://localhost/api/hyperframes/variants", { method: "POST", body: JSON.stringify({ productId: "p2", beats: [{ atSecond: 0, text: "x" }], targetPlatforms: ["tiktok"] }) }) as never);
    expect(res.status).toBe(404);
  });

  it("deterministic + disclosure + no auto render + no outputPath", async () => {
    vi.mocked(getSessionFromRequest).mockReturnValue({ userId: "u1", email: "u@x.com", exp: 1_999_999_999 });
    const payload = [{ platform: "tiktok", aspectRatio: "9:16", durationSeconds: 15, cta: "cta", captions: [{ start: 0, end: 4, text: "hello" }], disclosure: "#ad", renderTriggered: false }];
    vi.mocked(generatePlatformVariants).mockResolvedValue(payload as never);

    const reqBody = { productId: "p1", beats: [{ atSecond: 0, text: "hello" }], targetPlatforms: ["tiktok"] };
    const resA = await postVariants(new NextRequest("http://localhost/api/hyperframes/variants", { method: "POST", body: JSON.stringify(reqBody) }) as never);
    const resB = await postVariants(new NextRequest("http://localhost/api/hyperframes/variants", { method: "POST", body: JSON.stringify(reqBody) }) as never);

    const a = await resA.json();
    const b = await resB.json();
    expect(a.data.variants).toEqual(b.data.variants);
    expect(JSON.stringify(a)).toContain("disclosure");
    expect(JSON.stringify(a)).not.toContain("outputPath");
    expect(a.data.variants[0].renderTriggered).toBe(false);
  });
});
