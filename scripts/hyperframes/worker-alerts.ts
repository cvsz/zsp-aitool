import { loadEnvConfig } from "@next/env";
import { getHyperFramesOperatorStatus } from "@/lib/hyperframes/operator-status";

let envLoaded = false;

function ensureEnvLoaded(): void {
  if (envLoaded) return;
  loadEnvConfig(process.cwd());
  envLoaded = true;
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

type AlertConfig = {
  enabled: boolean;
  webhookUrl: string;
  failedThreshold: number;
  pendingThreshold: number;
  staleRunningThreshold: number;
  minFreeMb: number;
};

function getAlertConfig(): AlertConfig {
  ensureEnvLoaded();
  return {
    enabled: process.env.HYPERFRAMES_ALERT_ENABLED === "true",
    webhookUrl: process.env.HYPERFRAMES_ALERT_WEBHOOK_URL ?? "",
    failedThreshold: toInt(process.env.HYPERFRAMES_ALERT_FAILED_THRESHOLD, 3),
    pendingThreshold: toInt(process.env.HYPERFRAMES_ALERT_PENDING_THRESHOLD, 10),
    staleRunningThreshold: toInt(process.env.HYPERFRAMES_ALERT_STALE_RUNNING_THRESHOLD, 1),
    minFreeMb: toInt(process.env.HYPERFRAMES_ALERT_MIN_FREE_MB, 2048),
  };
}

export async function runWorkerAlerts(): Promise<number> {
  const config = getAlertConfig();
  if (!config.enabled) {
    console.log("[SKIP] HyperFrames alerts disabled");
    return 0;
  }

  if (!config.webhookUrl) {
    console.error("[FAIL] HYPERFRAMES_ALERT_WEBHOOK_URL is required when HYPERFRAMES_ALERT_ENABLED=true");
    return 1;
  }

  const s = await getHyperFramesOperatorStatus();
  const reasons: string[] = [];

  if (s.failedLast24h >= config.failedThreshold) reasons.push(`failedLast24h>=${config.failedThreshold}`);
  if (s.pending >= config.pendingThreshold) reasons.push(`pending>=${config.pendingThreshold}`);
  if (s.staleRunning >= config.staleRunningThreshold) reasons.push(`staleRunning>=${config.staleRunningThreshold}`);
  if (s.diskFreeMb !== null && s.diskFreeMb < config.minFreeMb) reasons.push(`freeDiskMb<${config.minFreeMb}`);
  if (s.serviceActive === false) reasons.push("serviceActive=false");

  if (reasons.length === 0) {
    console.log("[OK] No HyperFrames worker alerts");
    return 0;
  }

  const payload = {
    source: "zsp-aitool/hyperframes/worker-alerts",
    severity: "warning",
    reasons,
    summary: {
      pending: s.pending,
      running: s.running,
      staleRunning: s.staleRunning,
      failedLast24h: s.failedLast24h,
      freeDiskMb: s.diskFreeMb,
      serviceActive: s.serviceActive,
      serviceEnabled: s.serviceEnabled,
    },
    thresholds: {
      failedLast24h: config.failedThreshold,
      pending: config.pendingThreshold,
      staleRunning: config.staleRunningThreshold,
      minFreeMb: config.minFreeMb,
    },
    emittedAt: new Date().toISOString(),
  };

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`[FAIL] Alert webhook returned HTTP ${response.status}`);
    return 1;
  }

  console.log(`[OK] Alert sent (${reasons.join(", ")})`);
  return 0;
}

if (require.main === module) {
  runWorkerAlerts()
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error(`[FAIL] ${error instanceof Error ? error.message : "alerts failed"}`);
      process.exit(1);
    });
}
