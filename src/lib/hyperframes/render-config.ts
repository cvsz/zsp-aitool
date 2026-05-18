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
  };
}
