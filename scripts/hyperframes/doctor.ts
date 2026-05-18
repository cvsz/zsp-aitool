import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";
import { buildHyperFramesCommand, renderCommandToDisplayString } from "@/lib/hyperframes/render-command";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

const execFileAsync = promisify(execFile);

function statusLabel(enabled: boolean): "FAIL" | "WARN" {
  return enabled ? "FAIL" : "WARN";
}

async function main(): Promise<void> {
  const config = getHyperFramesRenderConfig();
  const createDirs = process.env.HYPERFRAMES_DOCTOR_CREATE_DIRS === "true";

  if (!config.enabled) {
    console.log(`[OK] HYPERFRAMES_RENDER_ENABLED=false`);
    console.log("[SKIP] HyperFrames render disabled");
  } else {
    console.log("[OK] HYPERFRAMES_RENDER_ENABLED=true");
  }

  for (const [name, argv] of [["node", ["--version"]], ["ffmpeg", ["-version"]]] as const) {
    const bin = name === "node" ? config.nodeBin : config.ffmpegBin;
    try {
      await execFileAsync(bin, argv);
      console.log(`[OK] ${name} found (${bin})`);
    } catch {
      console.log(`[${statusLabel(config.enabled)}] ${name} missing (${bin})`);
    }
  }

  const cliHelp = buildHyperFramesCommand(["--help"], config);
  const cliDisplay = renderCommandToDisplayString(buildHyperFramesCommand([], config));
  try {
    await execFileAsync(cliHelp.bin, cliHelp.args);
    console.log(`[OK] hyperframes CLI callable (${cliDisplay})`);
  } catch {
    console.log(`[${statusLabel(config.enabled)}] hyperframes CLI missing/unusable (${cliDisplay})`);
  }

  if (!config.enabled && !createDirs) {
    console.log("[SKIP] workdir/output dir checks skipped while render disabled");
    return;
  }

  if (createDirs) {
    await mkdir(config.workDir, { recursive: true });
    await mkdir(config.outputDir, { recursive: true });
  }

  for (const [label, dir] of [["workdir", config.workDir], ["output dir", config.outputDir]] as const) {
    try {
      await mkdir(dir, { recursive: false });
    } catch {}
    try {
      await execFileAsync("test", ["-d", dir]);
      await execFileAsync("test", ["-w", dir]);
      console.log(`[OK] ${label} writable (${dir})`);
    } catch {
      console.log(`[${statusLabel(config.enabled)}] ${label} not writable (${dir})`);
    }
  }
}

main().catch((error) => {
  console.log(`[FAIL] HyperFrames doctor crashed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
