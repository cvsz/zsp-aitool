import { describe, expect, it } from "vitest";
import { buildHyperFramesCommand } from "@/lib/hyperframes/render-command";

describe("buildHyperFramesCommand", () => {
  it("creates argv for npx mode", () => {
    const cmd = buildHyperFramesCommand(["render"], {
      enabled: true,
      workDir: "/tmp/w",
      outputDir: "/tmp/o",
      maxDurationSeconds: 60,
      maxConcurrentJobs: 1,
      nodeBin: "node",
      ffmpegBin: "ffmpeg",
      cliBin: "npx",
      cliArgs: ["-y", "hyperframes"],
      maxPendingJobs: 25,
      maxRunningJobs: 1,
      maxAttempts: 3,
      retryBackoffSeconds: 300,
      runningStaleMinutes: 30,
      minFreeMb: 2048,
      maxOutputMb: 512,
      retentionDays: 14,
      cleanupDryRun: true,
      watchdogStaleRunningMinutes: 30,
      watchdogMaxFailedLast24h: 5,
      watchdogMaxPendingJobs: 25,
      watchdogMinFreeMb: 2048,
      watchdogRequireServiceActive: true,
      watchdogRecoverStale: false,
      allowedQualityProfiles: "preview,standard,high",
      highQualityEnabled: false
    });

    expect(cmd.bin).toBe("npx");
    expect(cmd.args).toEqual(["-y", "hyperframes", "render"]);
  });

  it("creates argv for direct mode", () => {
    const cmd = buildHyperFramesCommand(["render"], {
      enabled: true,
      workDir: "/tmp/w",
      outputDir: "/tmp/o",
      maxDurationSeconds: 60,
      maxConcurrentJobs: 1,
      nodeBin: "node",
      ffmpegBin: "ffmpeg",
      cliBin: "hyperframes",
      cliArgs: [],
      maxPendingJobs: 25,
      maxRunningJobs: 1,
      maxAttempts: 3,
      retryBackoffSeconds: 300,
      runningStaleMinutes: 30,
      minFreeMb: 2048,
      maxOutputMb: 512,
      retentionDays: 14,
      cleanupDryRun: true,
      watchdogStaleRunningMinutes: 30,
      watchdogMaxFailedLast24h: 5,
      watchdogMaxPendingJobs: 25,
      watchdogMinFreeMb: 2048,
      watchdogRequireServiceActive: true,
      watchdogRecoverStale: false,
      allowedQualityProfiles: "preview,standard,high",
      highQualityEnabled: false
    });

    expect(cmd.bin).toBe("hyperframes");
    expect(cmd.args).toEqual(["render"]);
  });
});
