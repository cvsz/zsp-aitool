import { execFile } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { buildHyperFrameComposition } from "@/lib/hyperframes/build-composition";
import { getHyperFramesRenderConfig } from "@/lib/hyperframes/render-config";
import { buildHyperFramesCommand, renderCommandToDisplayString } from "@/lib/hyperframes/render-command";
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

  await mkdir(config.workDir, { recursive: true });
  const smokeProjectDir = await mkdtemp(path.join(config.workDir, "smoke-"));
  const smokeOutDir = path.join(config.outputDir, "smoke");

  try {
    await mkdir(smokeProjectDir, { recursive: true });
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

    const htmlPath = path.join(smokeProjectDir, "index.html");
    const metaPath = path.join(smokeProjectDir, "meta.json");
    const projectConfigPath = path.join(smokeProjectDir, "hyperframes.json");
    const rendersDir = path.join(smokeProjectDir, "renders");
    await writeFile(htmlPath, composition.compositionHtml, "utf8");
    await writeFile(metaPath, JSON.stringify({ title: "HyperFrames Smoke Render", duration: Math.min(config.maxDurationSeconds, 6) }), "utf8");
    await writeFile(projectConfigPath, JSON.stringify({}), "utf8");
    await mkdir(rendersDir, { recursive: true });

    const outputPath = ensureOutputWithinDir(smokeOutDir, "render-smoke.mp4");
    const cmd = buildHyperFramesCommand(["render", "--input", smokeProjectDir, "--output", outputPath, "--duration", String(Math.min(config.maxDurationSeconds, 6))], config);

    console.log(`[OK] running: ${renderCommandToDisplayString(cmd)}`);
    await execFileAsync(cmd.bin, cmd.args, { cwd: smokeProjectDir, env: process.env });
    console.log(`[OK] smoke render complete: ${outputPath}`);
    return { ok: true, skipped: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.log(`[FAIL] smoke render failed: ${message}`);
    return { ok: false, skipped: false };
  } finally {
    await rm(smokeProjectDir, { recursive: true, force: true });
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
