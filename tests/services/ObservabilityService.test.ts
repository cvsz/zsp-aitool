import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    observabilityEvent: { count: vi.fn().mockResolvedValue(2), findMany: vi.fn().mockResolvedValue([{ durationMs: 100 }]) },
    $queryRaw: vi.fn().mockResolvedValue([{ route: "/api/a", count: BigInt(1), avg_duration: 2000 }]),
    csvImportJob: { groupBy: vi.fn().mockResolvedValue([]) },
    aiContentQueueJob: { groupBy: vi.fn().mockResolvedValue([]) },
  },
}));
vi.mock("@/lib/hyperframes/operator-status", () => ({ getHyperFramesOperatorStatus: vi.fn().mockResolvedValue({ pending: 1, running: 1, staleRunning: 0, failedLast24h: 0 }) }));

import { getObservabilitySummary } from "@/services/ObservabilityService";

describe("ObservabilityService", () => {
  it("returns bounded summary", async () => {
    const summary = await getObservabilitySummary();
    expect(summary.errorsLast1h).toBe(2);
    expect(summary.slowApiRoutes[0]?.route).toBe("/api/a");
  });
});
