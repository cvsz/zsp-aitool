import { describe, it, expect, vi } from "vitest";
import * as auth from "@/lib/auth";
import { GET } from "@/app/api/hyperframes/quota/route";

const getUserQuotaSummary = vi.fn();
vi.mock("@/services/HyperFramesQuotaService", () => ({ HyperFramesQuotaService: { getUserQuotaSummary } }));

describe("hyperframes quota api", () => {
  it("returns 401 unauth", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue(null);
    const res = await GET(new Request("http://localhost/api/hyperframes/quota") as never);
    expect(res.status).toBe(401);
  });

  it("owner scoped response", async () => {
    vi.spyOn(auth, "getSessionFromRequest").mockReturnValue({ userId: "u1", email: "a@a.com" });
    getUserQuotaSummary.mockResolvedValueOnce({ remainingMonthlyRenders: 40, storageUsedMb: 12, storageQuotaMb: 1024, retentionDays: 14 });
    const res = await GET(new Request("http://localhost/api/hyperframes/quota") as never);
    const body = await res.json();
    expect(getUserQuotaSummary).toHaveBeenCalledWith("u1");
    expect(body.data.storageQuotaMb).toBe(1024);
  });
});
