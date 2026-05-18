import { getHyperFramesOperatorStatus } from "@/lib/hyperframes/operator-status";

async function main(): Promise<void> {
  const s = await getHyperFramesOperatorStatus();
  console.log(JSON.stringify({
    pending: s.pending,
    running: s.running,
    completedLast24h: s.completedLast24h,
    failedLast24h: s.failedLast24h,
    oldestPendingCreatedAt: s.oldestPendingCreatedAt,
    oldestRunningStartedAt: s.oldestRunningStartedAt,
    staleRunning: s.staleRunning,
    renderEnabled: s.renderEnabled,
    serviceActive: s.serviceActive,
    serviceEnabled: s.serviceEnabled,
    freeDiskMb: s.diskFreeMb,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(`[FAIL] ${error instanceof Error ? error.message : "queue status failed"}`);
  process.exit(1);
});
