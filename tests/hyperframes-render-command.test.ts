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
      cliArgs: ["-y", "hyperframes"]
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
      cliArgs: []
    });

    expect(cmd.bin).toBe("hyperframes");
    expect(cmd.args).toEqual(["render"]);
  });
});
