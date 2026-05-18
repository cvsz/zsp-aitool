import { describe, expect, it, vi } from "vitest";

import { GET, PUT } from "@/app/api/hyperframes/brand-kit/route";
import * as auth from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSetting: {
      findUnique: vi.fn(async (args: { where: { userId: string } }) => args.where.userId === "u1" ? { userId: "u1", brandColors: ["#22C55E"], fontPreference: null, logoUrl: null, watermarkText: null, defaultAspectRatio: "9:16", defaultCTA: null } : null),
      upsert: vi.fn(async (args: { create: object }) => args.create),
    },
  },
}));

describe("hyperframes brand kit api", () => {
  it("requires auth", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await GET(new Request("http://localhost/api/hyperframes/brand-kit") as never);
    expect(res.status).toBe(401);
  });

  it("is user scoped", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@a.com" });
    const res = await GET(new Request("http://localhost/api/hyperframes/brand-kit") as never);
    const body = await res.json();
    expect(body.data.brandColors).toEqual(["#22C55E"]);
  });

  it("blocks unsafe logo URL", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@a.com" });
    const req = new Request("http://localhost/api/hyperframes/brand-kit", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ brandColors: ["#22C55E"], logoUrl: "http://127.0.0.1/x.png" }) });
    const res = await PUT(req as never);
    expect(res.status).toBe(422);
  });

  it("blocks css/script injection strings", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "u@a.com" });
    const req = new Request("http://localhost/api/hyperframes/brand-kit", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ brandColors: ["#22C55E"], watermarkText: "<script>alert(1)</script>" }) });
    const res = await PUT(req as never);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.watermarkText).not.toContain("<script>");
  });
});
