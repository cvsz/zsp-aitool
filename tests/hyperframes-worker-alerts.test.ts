import { beforeEach, describe, expect, it, vi } from "vitest";

const operator = {
  pending: 0,
  running: 0,
  completedLast24h: 0,
  failedLast24h: 0,
  oldestPendingCreatedAt: null,
  oldestRunningStartedAt: null,
  staleRunning: 0,
  renderEnabled: true,
  maxPendingJobs: 25,
  maxRunningJobs: 1,
  diskFreeMb: 99999,
  serviceActive: true,
  serviceEnabled: true,
};

vi.mock("@/lib/hyperframes/operator-status", () => ({
  getHyperFramesOperatorStatus: vi.fn(async () => operator),
}));

describe("worker-alerts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env.HYPERFRAMES_ALERT_ENABLED = "false";
    process.env.HYPERFRAMES_ALERT_WEBHOOK_URL = "";
    process.env.HYPERFRAMES_ALERT_FAILED_THRESHOLD = "3";
    process.env.HYPERFRAMES_ALERT_PENDING_THRESHOLD = "10";
    process.env.HYPERFRAMES_ALERT_STALE_RUNNING_THRESHOLD = "1";
    process.env.HYPERFRAMES_ALERT_MIN_FREE_MB = "2048";
    Object.assign(operator, { pending: 0, running: 0, staleRunning: 0, failedLast24h: 0, diskFreeMb: 99999, serviceActive: true, serviceEnabled: true });
  });

  it("alert disabled exits 0", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const { runWorkerAlerts } = await import("../scripts/hyperframes/worker-alerts");
    await expect(runWorkerAlerts()).resolves.toBe(0);
    expect(log).toHaveBeenCalledWith("[SKIP] HyperFrames alerts disabled");
  });

  it("enabled missing webhook fails", async () => {
    process.env.HYPERFRAMES_ALERT_ENABLED = "true";
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const { runWorkerAlerts } = await import("../scripts/hyperframes/worker-alerts");
    await expect(runWorkerAlerts()).resolves.toBe(1);
    expect(err.mock.calls.join(" ")).toContain("HYPERFRAMES_ALERT_WEBHOOK_URL");
  });

  it("failed threshold triggers alert", async () => {
    process.env.HYPERFRAMES_ALERT_ENABLED = "true";
    process.env.HYPERFRAMES_ALERT_WEBHOOK_URL = "https://example.test/hook";
    operator.failedLast24h = 3;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const { runWorkerAlerts } = await import("../scripts/hyperframes/worker-alerts");
    await expect(runWorkerAlerts()).resolves.toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("pending threshold triggers alert", async () => {
    process.env.HYPERFRAMES_ALERT_ENABLED = "true";
    process.env.HYPERFRAMES_ALERT_WEBHOOK_URL = "https://example.test/hook";
    operator.pending = 12;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const { runWorkerAlerts } = await import("../scripts/hyperframes/worker-alerts");
    await expect(runWorkerAlerts()).resolves.toBe(0);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("webhook body shape safe and no local path leakage", async () => {
    process.env.HYPERFRAMES_ALERT_ENABLED = "true";
    process.env.HYPERFRAMES_ALERT_WEBHOOK_URL = "https://example.test/hook";
    operator.pending = 11;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const { runWorkerAlerts } = await import("../scripts/hyperframes/worker-alerts");
    await runWorkerAlerts();
    const bodyRaw = fetchMock.mock.calls[0]?.[1]?.body as string;
    const body = JSON.parse(bodyRaw);
    expect(body.summary).toEqual(expect.objectContaining({
      pending: expect.any(Number),
      running: expect.any(Number),
      staleRunning: expect.any(Number),
      failedLast24h: expect.any(Number),
      freeDiskMb: expect.anything(),
      serviceActive: expect.anything(),
      serviceEnabled: expect.anything(),
    }));
    expect(bodyRaw).not.toContain("outputPath");
    expect(bodyRaw).not.toContain("token");
    expect(bodyRaw).not.toContain("secret");
  });

  it("package scripts exist", async () => {
    const pkg = await import("../package.json");
    expect(pkg.default.scripts["hyperframes:worker:alerts"]).toBeDefined();
  });
});
