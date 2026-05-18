import { loadEnvConfig } from "@next/env";

export type HyperFramesRenderConfig = {
  enabled: boolean;
  workDir: string;
  outputDir: string;
  maxDurationSeconds: number;
  maxConcurrentJobs: number;
  nodeBin: string;
  ffmpegBin: string;
  cliBin: string;
  cliArgs: string[];
  maxPendingJobs: number;
  maxRunningJobs: number;
  maxAttempts: number;
  retryBackoffSeconds: number;
  runningStaleMinutes: number;
  minFreeMb: number;
  maxOutputMb: number;
  retentionDays: number;
  cleanupDryRun: boolean;
  watchdogStaleRunningMinutes: number;
  watchdogMaxFailedLast24h: number;
  watchdogMaxPendingJobs: number;
  watchdogMinFreeMb: number;
  watchdogRequireServiceActive: boolean;
  watchdogRecoverStale: boolean;
  shareEnabled: boolean;
  allowedQualityProfiles: string;
  highQualityEnabled: boolean;
  maxBatchSize: number;
  maxPendingPerUser: number;
};

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

function toArgv(value: string | undefined): string[] {
  return (value ?? "").split(/\s+/).map((v) => v.trim()).filter(Boolean);
}

export function getHyperFramesRenderConfig(): HyperFramesRenderConfig {
  ensureEnvLoaded();
  return {
    enabled: process.env.HYPERFRAMES_RENDER_ENABLED === "true",
    workDir: process.env.HYPERFRAMES_WORKDIR ?? "/var/lib/zsp-aitool/hyperframes",
    outputDir: process.env.HYPERFRAMES_OUTPUT_DIR ?? "/var/lib/zsp-aitool/hyperframes/renders",
    maxDurationSeconds: toInt(process.env.HYPERFRAMES_MAX_DURATION_SECONDS, 60),
    maxConcurrentJobs: toInt(process.env.HYPERFRAMES_MAX_CONCURRENT_JOBS, 1),
    nodeBin: process.env.HYPERFRAMES_NODE_BIN ?? "node",
    ffmpegBin: process.env.HYPERFRAMES_FFMPEG_BIN ?? "ffmpeg",
    cliBin: process.env.HYPERFRAMES_CLI_BIN ?? "hyperframes",
    cliArgs: toArgv(process.env.HYPERFRAMES_CLI_ARGS),
    maxPendingJobs: toInt(process.env.HYPERFRAMES_MAX_PENDING_JOBS, 25),
    maxRunningJobs: toInt(process.env.HYPERFRAMES_MAX_RUNNING_JOBS, 1),
    maxAttempts: toInt(process.env.HYPERFRAMES_MAX_ATTEMPTS, 3),
    retryBackoffSeconds: toInt(process.env.HYPERFRAMES_RETRY_BACKOFF_SECONDS, 300),
    runningStaleMinutes: toInt(process.env.HYPERFRAMES_RUNNING_STALE_MINUTES, 30),
    minFreeMb: toInt(process.env.HYPERFRAMES_MIN_FREE_MB, 2048),
    maxOutputMb: toInt(process.env.HYPERFRAMES_MAX_OUTPUT_MB, 512),
    retentionDays: toInt(process.env.HYPERFRAMES_RETENTION_DAYS, toInt(process.env.HYPERFRAMES_DEFAULT_RETENTION_DAYS, 14)),
    cleanupDryRun: process.env.HYPERFRAMES_CLEANUP_DRY_RUN !== "false",
    watchdogStaleRunningMinutes: toInt(process.env.HYPERFRAMES_WATCHDOG_STALE_RUNNING_MINUTES, 30),
    watchdogMaxFailedLast24h: toInt(process.env.HYPERFRAMES_WATCHDOG_MAX_FAILED_LAST_24H, 5),
    watchdogMaxPendingJobs: toInt(process.env.HYPERFRAMES_WATCHDOG_MAX_PENDING_JOBS, 25),
    watchdogMinFreeMb: toInt(process.env.HYPERFRAMES_WATCHDOG_MIN_FREE_MB, 2048),
    watchdogRequireServiceActive: process.env.HYPERFRAMES_WATCHDOG_REQUIRE_SERVICE_ACTIVE !== "false",
    watchdogRecoverStale: process.env.HYPERFRAMES_WATCHDOG_RECOVER_STALE === "true",
    shareEnabled: process.env.HYPERFRAMES_SHARE_ENABLED === "true",
    allowedQualityProfiles: process.env.HYPERFRAMES_ALLOWED_QUALITY_PROFILES ?? "preview,standard,high",
    highQualityEnabled: process.env.HYPERFRAMES_HIGH_QUALITY_ENABLED === "true",
    maxBatchSize: toInt(process.env.HYPERFRAMES_MAX_BATCH_SIZE, 10),
    maxPendingPerUser: toInt(process.env.HYPERFRAMES_MAX_PENDING_PER_USER, 10),
  };
}
