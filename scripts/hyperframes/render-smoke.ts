import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFramesCommand } from "@/lib/hyperframes/render-command";
import { ensureOutputWithinDir } from "@/lib/hyperframes/render-safety";

const execFileAsync = promisify(execFile);

type SmokeResult = { ok: boolean; skipped: boolean };

export async function runRenderSmoke(): Promise<SmokeResult> {
  const config = getHyperFramesRenderConfig();
  if (!config.enabled) {
    console.log("[SKIP] HYPERFRAMES_RENDER_ENABLED is not true");
    return { ok: false, skipped: true };
  }
  if (process.env.HYPERFRAMES_RENDER_SMOKE_CONFIRM !== "YES") {
    console.log("[SKIP] HYPERFRAMES_RENDER_SMOKE_CONFIRM must be YES");
    return { ok: false, skipped: true };
  }

  const root = await mkdtemp(path.join(config.workDir, "smoke-"));
  const smokeOutDir = path.join(config.outputDir, "smoke");

  try {
    await mkdir(root, { recursive: true });
    await mkdir(smokeOutDir, { recursive: true });

    const composition = buildHyperFrameComposition({
      productId: "smoke-product",
      platform: "facebook",
      aspectRatio: "16:9",
      durationSeconds: Math.min(config.maxDurationSeconds, 6),
      caption: "ทดสอบเรนเดอร์ HyperFrames แบบควบคุม",
      product: {
        title: "สินค้าเดโม่สำหรับเรนเดอร์",
        price: "199",
        currency: "THB",
        imageUrl: undefined,
        affiliateUrl: "https://example.com/aff/demo"
      }
    });

    const htmlPath = path.join(root, "composition.html");
    await writeFile(htmlPath, composition.compositionHtml, "utf8");

    const outputPath = ensureOutputWithinDir(smokeOutDir, "render-smoke.mp4");
    const cmd = buildHyperFramesCommand(["render", "--input", htmlPath, "--output", outputPath, "--duration", String(Math.min(config.maxDurationSeconds, 6))], config);

    console.log(`[OK] running: ${cmd.bin} ${cmd.args.join(" ")}`);
    await execFileAsync(cmd.bin, cmd.args, { cwd: root, env: process.env });
    console.log(`[OK] smoke render complete: ${outputPath}`);
    return { ok: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.log(`[FAIL] smoke render failed: ${message}`);
    return { ok: false, skipped: false };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

if (require.main === module) {
  runRenderSmoke().then((result) => {
    if (!result.ok && !result.skipped) {
      process.exitCode = 1;
    }
  }).catch((error) => {
    console.log(`[FAIL] smoke render crashed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
