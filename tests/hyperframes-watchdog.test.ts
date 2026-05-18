import { describe, it, expect, vi } from "vitest";

const state = { pending: 0, running: 0, completed: 0, failed: 0, stale: 0 };
vi.mock("@/lib/prisma", () => ({ prisma: { hyperFrameRenderJob: {
  count: vi.fn().mockImplementation(async ({ where }: any) => {
    if (where?.status === 'PENDING') return state.pending;
    if (where?.status === 'RUNNING' && where?.startedAt) return state.stale;
    if (where?.status === 'RUNNING') return state.running;
    if (where?.status === 'COMPLETED') return state.completed;
    if (where?.status === 'FAILED') return state.failed;
    return 0;
  }),
  findFirst: vi.fn().mockResolvedValue(null),
}}}));
vi.mock("node:child_process", async (o) => { const a = await o<typeof import('node:child_process')>(); return { ...a, execSync: vi.fn().mockReturnValue('active') }; });
vi.mock("node:fs", async (o) => { const a = await o<typeof import('node:fs')>(); return { ...a, statfsSync: vi.fn().mockReturnValue({ bavail: 10_000_000n, bsize: 1024n }) }; });
vi.mock("node:fs/promises", async (o) => { const a = await o<typeof import('node:fs/promises')>(); return { ...a, access: vi.fn().mockResolvedValue(undefined) }; });

describe('watchdog', () => {
  it('ok empty queue', async () => {
    process.env.HYPERFRAMES_RENDER_ENABLED = 'true';
    process.env.HYPERFRAMES_OUTPUT_DIR = '/tmp';
    const { runWatchdog } = await import('../scripts/hyperframes/worker-watchdog');
    await expect(runWatchdog()).resolves.toBe(0);
  });
  it('warn when failed threshold exceeded', async () => {
    state.failed = 6;
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { runWatchdog } = await import('../scripts/hyperframes/worker-watchdog');
    const code = await runWatchdog();
    expect(code).toBe(0);
    expect(log.mock.calls.join(' ')).toContain('[WARN] failedLast24h high');
    state.failed = 0;
  });
  it('fail when running above max', async () => {
    state.running = 3;
    process.env.HYPERFRAMES_MAX_RUNNING_JOBS = '1';
    const { runWatchdog } = await import('../scripts/hyperframes/worker-watchdog');
    await expect(runWatchdog()).resolves.toBe(1);
    state.running = 0;
  });
});
