import { execFile } from "node:child_process";
import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const defaultAllowed = [".mp4", ".webm", ".mov"] as const;

export type RenderArtifactValidationOptions = {
  minBytes: number;
  maxOutputMb: number;
  maxDurationSeconds: number;
  allowedExtensions?: readonly string[];
  ffprobeBin?: string;
  readProbeBytes?: number;
  probeDuration?: boolean;
};

export async function validateRenderArtifact(outputPath: string, options: RenderArtifactValidationOptions): Promise<void> {
  const allowedExtensions = new Set((options.allowedExtensions ?? defaultAllowed).map((ext) => ext.toLowerCase()));
  const ext = path.extname(outputPath).toLowerCase();
  if (!allowedExtensions.has(ext)) throw new Error(`artifact format not allowed: ${ext || "unknown"}`);
  await access(outputPath);
  const artifactStat = await stat(outputPath);
  if (!artifactStat.isFile()) throw new Error("artifact is not a file");
  if (artifactStat.size < options.minBytes) throw new Error(`artifact too small: ${artifactStat.size} bytes`);
  const maxBytes = options.maxOutputMb * 1024 * 1024;
  if (artifactStat.size > maxBytes) throw new Error(`output exceeds max size: ${artifactStat.size} > ${maxBytes}`);
  await ensureReadable(outputPath, options.readProbeBytes ?? 4096);
  if (options.probeDuration !== false) await validateDurationWithFfprobe(outputPath, options.ffprobeBin ?? "ffprobe", options.maxDurationSeconds);
}

async function ensureReadable(filePath: string, maxBytes: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath, { start: 0, end: Math.max(1, maxBytes) - 1 });
    let done = false;
    const finish = (error?: Error) => {
      if (done) return;
      done = true;
      stream.destroy();
      if (error) reject(error); else resolve();
    };
    stream.once("error", () => finish(new Error("artifact read check failed")));
    stream.once("readable", () => {
      const chunk = stream.read(1) as Buffer | null;
      if (!chunk || chunk.length === 0) finish(new Error("artifact read check failed")); else finish();
    });
    stream.once("end", () => finish(new Error("artifact read check failed")));
  });
}

async function validateDurationWithFfprobe(outputPath: string, ffprobeBin: string, maxDurationSeconds: number): Promise<void> {
  try {
    const { stdout } = await execFileAsync(ffprobeBin, ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", outputPath]);
    const duration = Number.parseFloat(String(stdout).trim());
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("artifact duration invalid");
    const hardMax = Math.max(maxDurationSeconds + 5, maxDurationSeconds * 1.2);
    if (duration > hardMax) throw new Error(`artifact duration out of range: ${duration.toFixed(2)}s`);
  } catch (error) {
    if (error instanceof Error && /ENOENT|spawn/i.test(error.message)) return;
    throw error;
  }
}
